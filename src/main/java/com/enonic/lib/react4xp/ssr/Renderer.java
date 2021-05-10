package com.enonic.lib.react4xp.ssr;

import com.enonic.lib.react4xp.ssr.engineFactory.EngineFactory;
import com.enonic.lib.react4xp.ssr.errors.ErrorHandler;
import com.enonic.lib.react4xp.ssr.errors.RenderException;
import com.enonic.lib.react4xp.ssr.resources.AssetLoader;
import com.enonic.lib.react4xp.ssr.resources.ChunkDependencyParser;
import com.enonic.xp.resource.ResourceService;
import com.enonic.xp.server.RunMode;
import jdk.nashorn.api.scripting.NashornScriptEngine;
import jdk.nashorn.api.scripting.ScriptObjectMirror;
import org.json.JSONArray;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.script.ScriptException;
import java.io.IOException;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.Map;
import java.util.function.Supplier;

/**
 * Created on 10/05/2021 as part of
 */
public class Renderer {
    private final static Logger LOG = LoggerFactory.getLogger( Renderer.class );

                                                                                                                        private long id;

    public static final boolean IS_PRODMODE = (RunMode.get() == RunMode.PROD);

    private boolean valid = true;
    private NashornScriptEngine engine;
    private final Config config;
    private AssetLoader assetLoader;

    public static final String KEY_HTML = "html";

    public Renderer(long id, EngineFactory engineFactory, Supplier< ResourceService > resourceServiceSupplier, Config config) throws ScriptException, IOException {
        this.id = id;
                                                                                                                        LOG.info("------ We're gonna need a new SSR engine: Init#" + id);
        this.config = config;

        engine = engineFactory.buildEngine();

        LinkedList<String> dependencies = new ChunkDependencyParser().getScriptDependencyNames(config);
        if (config.userAddedNashornpolyfillsFilename != null && !"".equals(config.userAddedNashornpolyfillsFilename.trim())) {
            dependencies.addFirst(config.userAddedNashornpolyfillsFilename);
        }

        assetLoader = new AssetLoader(resourceServiceSupplier, config);
                                                                                                                        //if (!IS_PRODMODE) {
                                                                                                                            LOG.info("Init " + this + " with " + assetLoader + " and dependencies:\n\t" + String.join("\n\t", dependencies));
                                                                                                                        //}

        assetLoader.loadAssets(dependencies, engine);
                                                                                                                        // For testing: https://github.com/enonic/lib-react4xp/issues/191
                                                                                                                        /*
                                                                                                                        try {
                                                                                                                            LOG.info(this + " taking a nap...");
                                                                                                                            Thread.sleep(5000);
                                                                                                                            LOG.info(this + " waking up. Ready.");
                                                                                                                        } catch (InterruptedException e) {
                                                                                                                            e.printStackTrace();
                                                                                                                        }
                                                                                                                        //*/
    }

    private LinkedList<String> getRunnableAssetNames(String entryName, String dependencyNames) {
        LinkedList<String> runnableAssets = new LinkedList<>();

        if (dependencyNames != null && !"".equals(dependencyNames.trim())) {
            JSONArray array = new JSONArray(dependencyNames);
            Iterator<Object> it = array.iterator();
            while (it.hasNext()) {
                String assetName = (String)it.next();
                if (assetName.endsWith(".js")) {
                    runnableAssets.add(assetName);
                }
            }
        }
        String fullEntryName = entryName + ".js";
        runnableAssets.add(fullEntryName);

        return runnableAssets;
    }

    ///////////////////////////////////////////////////////////////////////////////

    private Map<String, String> runSSR(String entry, String props, LinkedList<String> assetsInvolved) {

        String callScript = "var obj = { " +
                KEY_HTML + ": ReactDOMServer.renderToString(" + config.LIBRARY_NAME  + "['" + entry + "'].default(" + props  + ")) " +
                "};" +
                "obj;";


        try {
            ScriptObjectMirror obj = (ScriptObjectMirror)engine.eval(callScript);

            String rendered = (String)obj.get(KEY_HTML);

            return Map.of( KEY_HTML, rendered );

        } catch (ScriptException e) {
            ErrorHandler errorHandler = new ErrorHandler();
            String cleanErrorMessage = errorHandler.getCleanErrorMessage(e);
            LOG.error(
                    errorHandler.getLoggableStackTrace(e, cleanErrorMessage) + "\n\n" +
                            e.getClass().getSimpleName() + ": " + cleanErrorMessage + "\n" +
                            "in " + ServerSideRenderer.class.getName() + ".runSSR\n" +
                            "Entry: '" + entry + "'\n" +
                            "Assets involved:\n\t" + String.join("\n\t", assetsInvolved) + "\n" +
                            "Failing call: '" + callScript + "'\n" +
                            errorHandler.getSolutionTips());

            destroy();
            return Map.of( errorHandler.KEY_ERROR, cleanErrorMessage );
        }
    }

    /**
     * Renders an entry to an HTML string.
     * @param entryName name of a transpiled JSX component, i.e. jsxPath: the filextension-less path to the compiled entry asset under assets/react4xp/, e.g: "site/parts/simple-reactive/simple-reactive"
     * @param props valid stringified JSON object: the entry's react props, e.g. '{"insertedMessage": "this is a prop!"}'
     * @param dependencyNames valid stringified JSON array: a set of file names to load into the engine (if not already done during initialization), needed by the entry before running it
     * @returns {Map} Under the key 'html' (KEY_HTML), naked rendered HTML if successful. Under the key 'error' (KEY_ERROR), error message if failed.
     */
    public Map<String, String> render(String entryName, String props, String dependencyNames) {
        try {
            if (!valid) {
                throw new RenderException("Concurrency failure: " + this + " has been killed because of a previous error.");
            }

            LinkedList<String> runnableAssetNames = getRunnableAssetNames(entryName, dependencyNames);
            assetLoader.loadAssets(runnableAssetNames, engine);
            Map<String, String> rendered = runSSR(entryName, props, runnableAssetNames);
            return rendered;

        } catch (RenderException r) {
            ErrorHandler errorHandler = new ErrorHandler();
            LOG.error(errorHandler.getLoggableStackTrace(r, null));
            destroy();
            return Map.of(
                    errorHandler.KEY_ERROR, r.getMessage()
            );

        } catch (Exception e) {
            ErrorHandler errorHandler = new ErrorHandler();
            LOG.error(errorHandler.getLoggableStackTrace(e, null));
            destroy();
            return Map.of(
                    errorHandler.KEY_ERROR, e.getClass().getName() + ": " + e.getMessage()
            );
        }
    }



    /////////////////////////////////////////////////////////////////////////////// Identity


                                                                                                                        public String toString() {
                                                                                                                            return Renderer.class.getSimpleName() + "#" + id + (
                                                                                                                                    !valid
                                                                                                                                            ? "(dead)"
                                                                                                                                            : "(ok)"
                                                                                                                            );
                                                                                                                        }




    /////////////////////////////////////////////////////////////////////////////// Apache commons pool2 lifecycle


    public boolean validate() {
                                                                                                                        LOG.debug("Validating: " + this + ": " + valid);
        return valid;
    }
    public void destroy() {
        valid = false;
        engine = null;
        System.gc();
                                                                                                                        LOG.info("Destroyed: " + this);
        // FIXME: This doesn't seem to be enough? https://stackoverflow.com/questions/32520413/scriptengine-clear-and-dispose
        // TODO: How to completely displose of a running nashorn engine?
    }
}
