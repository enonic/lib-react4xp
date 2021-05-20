package com.enonic.lib.react4xp.ssr.pool;

import com.enonic.lib.react4xp.ssr.Config;
import com.enonic.lib.react4xp.ssr.ServerSideRenderer;
import com.enonic.lib.react4xp.ssr.engineFactory.EngineFactory;
import com.enonic.lib.react4xp.ssr.errors.ErrorHandler;
import com.enonic.lib.react4xp.ssr.errors.RenderException;
import com.enonic.lib.react4xp.ssr.resources.AssetLoader;
import com.enonic.lib.react4xp.ssr.resources.ChunkDependencyParser;
import com.enonic.lib.react4xp.ssr.resources.ResourceReader;
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


public class Renderer {
    private final static Logger LOG = LoggerFactory.getLogger( Renderer.class );

    private final long id;

    //public static final boolean IS_PRODMODE = (RunMode.get() == RunMode.PROD);

    private boolean valid = true;
    private NashornScriptEngine engine;
    private final Config config;
    private AssetLoader assetLoader;

    public static final String KEY_HTML = "html";

    public Renderer(EngineFactory engineFactory, ResourceReader resourceReader, Config config, long id) throws ScriptException, IOException {
        this.id = id;

        // if (!IS_PRODMODE) {
        LOG.info(this + ": starting init...");
        // }

        this.config = config;

        engine = engineFactory.buildEngine(id);

        LinkedList<String> dependencies = new ChunkDependencyParser(resourceReader, id).getScriptDependencyNames(config);
        if (config.USERADDED_NASHORNPOLYFILLS_FILENAME != null && !"".equals(config.USERADDED_NASHORNPOLYFILLS_FILENAME.trim())) {
            dependencies.addFirst(config.USERADDED_NASHORNPOLYFILLS_FILENAME);
        }

        assetLoader = new AssetLoader(resourceReader, config, id);

        assetLoader.loadAssetsIntoEngine(dependencies, engine);

        // if (!IS_PRODMODE) {
        LOG.info(this + ": init is done.");
        // }
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
                KEY_HTML + ": ReactDOMServer.renderToString(" + config.LIBRARY_NAME + "['" + entry + "'].default(" + props  + ")) " +
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
            assetLoader.loadAssetsIntoEngine(runnableAssetNames, engine);
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
        return Renderer.class.getSimpleName() + "#" + id;
    }




    /////////////////////////////////////////////////////////////////////////////// Apache commons pool2 lifecycle


    public boolean validate() {
        return valid;
    }
    public void destroy() {
        valid = false;

        // if (!IS_PRODMODE) {
        LOG.info(this + ": destroyed.");
        // }

        engine = null;
        System.gc();
        // FIXME: This doesn't seem to be enough? https://stackoverflow.com/questions/32520413/scriptengine-clear-and-dispose
        // TODO: How to completely displose of a running nashorn engine? If not, this will accumulate memory over time!
    }
}
