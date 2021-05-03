package com.enonic.lib.react4xp.ssr;

import com.enonic.xp.resource.Resource;
import com.enonic.xp.resource.ResourceKey;
import com.enonic.xp.resource.ResourceService;
import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;
import com.enonic.xp.server.RunMode;
import jdk.nashorn.api.scripting.NashornScriptEngine;
import jdk.nashorn.api.scripting.ScriptObjectMirror;
import org.apache.commons.io.Charsets;
import org.json.JSONArray;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.script.ScriptException;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.function.Supplier;




public class ServerSideRenderer implements ScriptBean {
    private final static Logger LOG = LoggerFactory.getLogger( ServerSideRenderer.class );

    private static final class CacheMarker {
        public boolean isCached = false;
    }

    private static final boolean IS_PRODMODE = (RunMode.get() == RunMode.PROD);
    private static final HashMap<String, CacheMarker> ASSET_CACHE_MARKERS = new HashMap<>();
    private static final EngineFactory ENGINE_FACTORY = new EngineFactory();

    private static final String KEY_HTML = "html";
    private static final String KEY_ERROR = "error";

    // Constants. TODO: SHOULD BE final?
    private String SCRIPTS_HOME = null;
    private String LIBRARY_NAME = null;
    private String APP_NAME = null;
    private NashornScriptEngine ENGINE = null;
    private Supplier<ResourceService> RESOURCE_SERVICE_SUPPLIER;



    ////////////////////////////////////////////////////////////////////////// INIT

    public void setup(
            String APP_NAME,
            String SCRIPTS_HOME,
            String LIBRARY_NAME,
            String chunkfilesHome,
            String userAddedNashornpolyfillsFilename,
            String entriesJsonFilename,
            String chunksExternalsJsonFilename,
            String statsComponentsFilename,
            boolean lazyload,
            String[] scriptEngineSettings
    ) throws IOException, ScriptException {
        this.APP_NAME = APP_NAME;
        this.SCRIPTS_HOME = SCRIPTS_HOME;                             // "/react4xp"
        this.LIBRARY_NAME = LIBRARY_NAME;                             // "React4xp"

        synchronized (ENGINE_FACTORY) {
            EngineContainer engineContainer = ENGINE_FACTORY.initEngine(scriptEngineSettings);
            ENGINE = engineContainer.ENGINE;

            if (engineContainer.isFresh) {
                LinkedList<String> dependencies = new ChunkDependencyParser().getScriptDependencyNames(chunkfilesHome, entriesJsonFilename, chunksExternalsJsonFilename, statsComponentsFilename, lazyload);


                if (userAddedNashornpolyfillsFilename != null && !"".equals(userAddedNashornpolyfillsFilename.trim())) {
                    dependencies.addFirst(userAddedNashornpolyfillsFilename);
                }
                loadAssets(dependencies);
            }
        }
    }




    /////////////////////////////////////////////////////////////// Helpers


    private void ensureProdCache(List<String> assetNames) {
        if (!IS_PRODMODE) {
            return;
        }
        synchronized (ASSET_CACHE_MARKERS) {
            for (String assetName : assetNames) {
                if (!ASSET_CACHE_MARKERS.containsKey(assetName)) {
                    ASSET_CACHE_MARKERS.put(assetName, new CacheMarker());
                }
            }
        }
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



    private void loadAssets(LinkedList<String> runnableAssets) {
        ensureProdCache(runnableAssets);
        for (String assetName : runnableAssets) {
            maybeLoadAsset(assetName);
        }
    }



    private void maybeLoadAsset(String assetName) {
        if (IS_PRODMODE) {
            CacheMarker assetCacheMarker = ASSET_CACHE_MARKERS.get(assetName);
            synchronized (assetCacheMarker) {
                if (!assetCacheMarker.isCached) {
                    loadAsset(assetName);
                }
            }
        } else {
            loadAsset(assetName);
        }
    }



    /** Load both entry assets and JS dependency chunks into the Nashorn engine */
    private void loadAsset(String assetName) {
        String assetCode = null, url = null;

        try {
            url = APP_NAME + ":" + SCRIPTS_HOME + "/" + assetName;

            // TODO: DRY
            ResourceKey resourceKey = ResourceKey.from(url);
            Resource resource = RESOURCE_SERVICE_SUPPLIER.get().getResource(resourceKey);
            assetCode = resource.getBytes().asCharSource(Charsets.UTF_8).read();

            //processedCode += assetCode + "\n";

            ENGINE.eval(assetCode);

            if (IS_PRODMODE) {
                ASSET_CACHE_MARKERS.get(assetName).isCached = true;
            }

        } catch (IOException e1) {
            LOG.error(
                    getLoggableStackTrace(e1, null) + "\n\n" +
                    e1.getClass().getSimpleName()  + ": " + e1.getMessage() + "\n" +
                    "in " + ServerSideRenderer.class.getName() + ".loadAsset\n" +
                    "assetName = '" + assetName + "'\n" +
                    "resource url = '" + url + "'\n" +
                    getSolutionTips());

            if (IS_PRODMODE) {
                ASSET_CACHE_MARKERS.get(assetName).isCached = false;

            }
            throw new RenderException(e1.getMessage());

        } catch (ScriptException e2) {
            String cleanErrorMessage = getCleanErrorMessage(e2);
            LOG.error(
                    getLoggableStackTrace(e2, cleanErrorMessage) + "\n\n" +
                    e2.getClass().getSimpleName() + ": " + cleanErrorMessage + "\n" +
                    "in " + ServerSideRenderer.class.getName() + ".loadAsset\n" +
                    "assetName = '" +assetName + "'\n" +
                    "resource url = '" + url + "'\n" +
                    getSolutionTips());

            if (IS_PRODMODE) {
                ASSET_CACHE_MARKERS.get(assetName).isCached = false;
            }
            throw new RenderException(cleanErrorMessage);
        }
    }


    private Map<String, String> runSSR(String entry, String props, LinkedList<String> assetsInvolved) throws ScriptException {

        String callScript = "var obj = { " +
                KEY_HTML + ": ReactDOMServer.renderToString(" + LIBRARY_NAME  + "['" + entry + "'].default(" + props  + ")) " +
                "};" +
                "obj;";


        try {
            ScriptObjectMirror obj = (ScriptObjectMirror)ENGINE.eval(callScript);

            String rendered = (String)obj.get(KEY_HTML);

            return Map.of( KEY_HTML, rendered );

        } catch (ScriptException e) {
            String cleanErrorMessage = getCleanErrorMessage(e);
            LOG.error(
                    getLoggableStackTrace(e, cleanErrorMessage) + "\n\n" +
                    e.getClass().getSimpleName() + ": " + cleanErrorMessage + "\n" +
                    "in " + ServerSideRenderer.class.getName() + ".runSSR\n" +
                    "entry = '" + entry + "'\n" +
                    "Failing call: '" + callScript + "'\n" +
                    getSolutionTips());

            if (IS_PRODMODE && assetsInvolved != null) {
                for (String asset : assetsInvolved) {
                    CacheMarker cacheMarker = ASSET_CACHE_MARKERS.get(asset);
                    synchronized (cacheMarker) {
                        cacheMarker.isCached = false;
                    }
                }
            }
            ENGINE.eval("delete " + LIBRARY_NAME + "['" + entry + "']");

            return Map.of( KEY_ERROR, cleanErrorMessage );
        }
    }





///////////////////////////////////////////////////////////// Error handling

    private String getCleanErrorMessage(Exception e) {
        return e.getMessage().replaceAll(" in <eval> at line number \\d+ at column number \\d++", "");
    }

    private String getLoggableStackTrace(Exception e, String overrideMessage) {
        String message = (overrideMessage == null)
                ? e.getMessage()
                : overrideMessage;
        StringWriter sw = new StringWriter();
        e.printStackTrace(new PrintWriter(sw));
        return e.getClass().getName() + ": " + message + "\n" + sw;
    }

    private String getSolutionTips() {
        return "\nSOLUTION TIPS: The previous error message may refer to lines in compiled/mangled code. To increase readability, you can try react4xp clientside-rendering or building react4xp with buildEnv = development or gradle CLI argument -Pdev. Remember to clear all cached behavior first (stop continuous builds, clear/rebuild your project, restart the XP server, clear browser cache). Actual line numbers in compiled JS source files tends to be referred in the stack trace above: look for '(<eval>: [lineNumber])' on the lines below '...NativeError.java...':.\n\n";
    }

    private class RenderException extends RuntimeException {
        private final String message;

        private RenderException(String message) {
            this.message = message;
        }

        @Override
        public String getMessage() {
            return message;
        }
    }




////////////////////////////////////////////////////////////////  Render



    /**
     * Renders an entry to an HTML string.
     * @param entryName name of a transpiled JSX component, i.e. jsxPath: the filextension-less path to the compiled entry asset under assets/react4xp/, e.g: "site/parts/simple-reactive/simple-reactive"
     * @param props valid stringified JSON object: the entry's react props, e.g. '{"insertedMessage": "this is a prop!"}'
     * @param dependencyNames valid stringified JSON array: a set of file names to load into the engine (if not already done during initialization), needed by the entry before running it
     * @returns {Map} Under the key 'html' (KEY_HTML), naked rendered HTML if successful. Under the key 'error' (KEY_ERROR), error message if failed.
     */
    public Map<String, String> render(String entryName, String props, String dependencyNames) {

        try {
            LinkedList<String> runnableAssetNames = getRunnableAssetNames(entryName, dependencyNames);
            loadAssets(runnableAssetNames);
            Map<String, String> rendered = runSSR(entryName, props, runnableAssetNames);
            return rendered;

        } catch (RenderException r) {
            return Map.of(
                    KEY_ERROR, r.getMessage()
            );

        } catch (Exception e) {
            LOG.error(getLoggableStackTrace(e, null));
            return Map.of(
                    KEY_ERROR, e.getClass().getName() + ": " + e.getMessage()
            );
        }
    }

    @Override
    public void initialize(BeanContext context) {
        this.RESOURCE_SERVICE_SUPPLIER = context.getService(ResourceService.class);
    }
}
