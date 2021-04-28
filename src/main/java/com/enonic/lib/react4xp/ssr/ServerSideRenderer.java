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



    public void setConfig(
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
                                                                                                                        LOG.info("");
                                                                                                                        LOG.info("ServerSideRenderer" + this.hashCode() + ".setConfig with: ");
                                                                                                                        LOG.info("  APP_NAME: " + APP_NAME);
                                                                                                                        LOG.info("  LIBRARY_NAME: " + LIBRARY_NAME);
                                                                                                                        LOG.info("  SCRIPTS_HOME: " + SCRIPTS_HOME);
                                                                                                                        LOG.info("  CHUNKFILES_HOME: " + chunkfilesHome);
                                                                                                                        LOG.info("  NASHORNPOLYFILLS_FILENAME: " + userAddedNashornpolyfillsFilename);
                                                                                                                        LOG.info("  entriesJsonFilename: " + entriesJsonFilename);
                                                                                                                        LOG.info("  EXTERNALS_CHUNKS_FILENAME: " + chunksExternalsJsonFilename);
                                                                                                                        LOG.info("  COMPONENT_STATS_FILENAME: " + statsComponentsFilename);
                                                                                                                        LOG.info("  lazyLoading: " + lazyload);
                                                                                                                        LOG.info("  scriptEngineSettings: " + scriptEngineSettings);
                                                                                                                        LOG.info("");

        this.APP_NAME = APP_NAME;
        this.SCRIPTS_HOME = SCRIPTS_HOME;                             // "/react4xp"
        this.LIBRARY_NAME = LIBRARY_NAME;                             // "React4xp"

        synchronized (ENGINE_FACTORY) {
                                                                                                                        LOG.info("##################### ServerSideRenderer" + this.hashCode() + ".setconfig  / sync by EngineFactory"+ENGINE_FACTORY.hashCode());
            EngineContainer engineContainer = ENGINE_FACTORY.initEngine(scriptEngineSettings);
            ENGINE = engineContainer.ENGINE;

            if (engineContainer.isFresh) {
                LinkedList<String> dependencies = new ChunkDependencyParser().getScriptDependencyNames(chunkfilesHome, entriesJsonFilename, chunksExternalsJsonFilename, statsComponentsFilename, lazyload);


                if (userAddedNashornpolyfillsFilename != null && !"".equals(userAddedNashornpolyfillsFilename.trim())) {
                    dependencies.addFirst(userAddedNashornpolyfillsFilename);
                }
                                                                                                                        for (String dep : dependencies) {
                                                                                                                            LOG.info("setConfig - dependencies: " + dep);
                                                                                                                        }
                loadAssets(dependencies);
            }
            LOG.info("##################### /ServerSideRenderer" + this.hashCode() + ".setconfig done.");
        }
    }

    ///////////////////////////////////////////////////////////////


    /*private void addEntriesAndChunksScripts(String CHUNKFILES_HOME, String COMPONENT_STATS_FILENAME, ArrayList<String> CHUNK_SOURCEFILENAMES, String ENTRIES_SOURCEFILENAME, LinkedList<String> scriptExecutionOrder, HashMap<String, String> scriptContentsByFilename, boolean doLazyLoad) throws IOException {
        String ENTRIES_SOURCE = CHUNKFILES_HOME + ENTRIES_SOURCEFILENAME;
        ArrayList<String> CHUNKS_SOURCES = new ArrayList<>();
        for (String chunkFileName : CHUNK_SOURCEFILENAMES) {
            CHUNKS_SOURCES.add(CHUNKFILES_HOME + chunkFileName);
        }
        LOG.info("initBasicSettings - CHUNKS_SOURCES: " + CHUNKS_SOURCES);

        LinkedHashSet<String> transpiledDependencies = new ChunkDependencyParser().getScriptDependencyNames(CHUNKFILES_HOME + COMPONENT_STATS_FILENAME, CHUNKS_SOURCES, ENTRIES_SOURCE, doLazyLoad);

        for (String scriptFile : transpiledDependencies) {
            String file = CHUNKFILES_HOME + scriptFile;
            scriptContentsByFilename.put(file, ResourceHandler.readResource(file));
            scriptExecutionOrder.add(file);
            scriptHasBeenLoadedByName.put(file, false);
            LOG.info("addEntriesAndChunksScripts - scriptHasBeenLoadedByName: " + file + " -> false");
        }
    }*/


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

    private void maybeLoadAsset(String assetName) {
        LOG.info("SSR asset: " + assetName);
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

            ENGINE.eval(assetCode);

            if (IS_PRODMODE) {
                ASSET_CACHE_MARKERS.get(assetName).isCached = true;
                LOG.info("Cached: " + assetName);
            }

        } catch (IOException e1) {
            LOG.error(e1.getClass().getSimpleName() + " in " + ServerSideRenderer.class.getName() + ".loadDependency:");
            LOG.error("assetName = '" +assetName + "'   |   asset url = '" + url + "'");
            LOG.error(e1.getMessage());

            if (IS_PRODMODE) {
                ASSET_CACHE_MARKERS.get(assetName).isCached = false;
                LOG.info("Removing from cache: " + assetName);
            }

        } catch (ScriptException e2) {
            e2.printStackTrace();
            LOG.info("");
            LOG.error(e2.getClass().getSimpleName() + " in " + ServerSideRenderer.class.getName() + ".loadDependency:");
            LOG.error("assetName = '" +assetName + "'   |   asset url = '" + url + "'");
            LOG.error(e2.getMessage());
            LOG.info("");
            LOG.info("Code dump:");
            LOG.info("---------------------------------\n\n");
            LOG.info(assetCode + "\n\n");
            LOG.info("---------------------------------------\n");
            LOG.info("...end of code dump: " + assetName);
            LOG.info("");
            LOG.info("SOLUTION TIPS: The previous error message tends to refer to lines in compiled/mangled code. To increase readability, you can try react4xp clientside-rendering or building react4xp with buildEnv = development or gradle CLI argument -Pdev. Also remember to clear all cached behavior: stop continuous builds, clear/rebuild your project, restart the XP server, clear browser cache.\n\n");

            if (IS_PRODMODE) {
                ASSET_CACHE_MARKERS.get(assetName).isCached = false;
                LOG.info("Removing from cache: " + assetName);
            }
        }
    }

    private Map<String, String> runSSR(String entry, String props, LinkedList<String> assetsInvolved) throws ScriptException {

        String callScript = "var obj = { " +
                KEY_HTML + ": ReactDOMServer.renderToString(" + LIBRARY_NAME  + "['" + entry + "'].default(" + props  + ")) " +
                "};" +
                "obj;";

        LOG.info("triggerSSR - call: " + callScript);

        try {
            ScriptObjectMirror obj = (ScriptObjectMirror)ENGINE.eval(callScript);

            String rendered = (String)obj.get(KEY_HTML);
            LOG.info("finalizeAndRender - " + KEY_HTML + ": " + entry);

            return Map.of( KEY_HTML, rendered );

        } catch (ScriptException e) {
            e.printStackTrace();
            LOG.info("");
            LOG.error(e.getClass().getSimpleName() + " in " + ServerSideRenderer.class.getName() + ".triggerSSR:");
            LOG.error("entry = '" + entry);
            LOG.error(e.getMessage());
            LOG.info("");
            LOG.info("Failing trigger call:");
            LOG.info(callScript + "\n\n");

            if (IS_PRODMODE && assetsInvolved != null) {
                LOG.info("triggerSSR - assetsInvolved: " + assetsInvolved);
                for (String asset : assetsInvolved) {
                    LOG.info("triggerSSR - removing asset cache: " + asset);
                    CacheMarker cacheMarker = ASSET_CACHE_MARKERS.get(asset);
                    synchronized (cacheMarker) {
                        cacheMarker.isCached = false;
                    }
                }
            }
            LOG.info("triggerSSR - deleting " + LIBRARY_NAME + "['" + entry + "'] from the SSR engine");
            ENGINE.eval("delete " + LIBRARY_NAME + "['" + entry + "']");

            return Map.of( KEY_ERROR, e.getClass().getName() + ": " + e.getMessage() );
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




    ///////////////////////////////////////////////////////

    /**
     * Renders an entry to an HTML string.
     * @param entryName name of a transpiled JSX component, i.e. jsxPath: the filextension-less path to the compiled entry asset under assets/react4xp/, e.g: "site/parts/simple-reactive/simple-reactive"
     * @param props valid stringified JSON object: the entry's react props, e.g. '{"insertedMessage": "this is a prop!"}'
     * @returns {Map} Under the key 'html' (KEY_HTML), naked rendered HTML if successful. Under the key 'error' (KEY_ERROR), error message if failed.
     */
    public Map<String, String> render(String entryName, String props) {

        LOG.info("---------------------------------------\n\n\n\nrender - START:");
        LOG.info("render - entryName: " + entryName);

        try {
            LinkedList<String> runnableAssetNames = getRunnableAssetNames(entryName, null);
            loadAssets(runnableAssetNames);
            Map<String, String> rendered = runSSR(entryName, props, runnableAssetNames);
                                                                                                                        LOG.info("Rendered HTML:");
                                                                                                                        LOG.info(rendered.get(KEY_HTML));
                                                                                                                        LOG.info("---------------------- render - the end.\n\n\n\n");
            return rendered;

        } catch (Exception e) {
            e.printStackTrace();
                                                                                                                        LOG.info("---------------------- render - I dieded.\n\n\n\n");
            return Map.of(
                    KEY_ERROR, e.getClass().getName() + ": " + e.getMessage()
            );
        }
    }



    /**
     * Same as renderToString, but only used when the engine has been initialized (setConfig) with lazyLoading = true
     * @param entryName name of a transpiled JSX component, i.e. jsxPath: the filextension-less path to the compiled entry asset under assets/react4xp/, e.g: "site/parts/simple-reactive/simple-reactive"
     * @param props valid stringified JSON object: the entry's react props, e.g. '{"insertedMessage": "this is a prop!"}'
     * @param dependencyNames valid stringified JSON array: a set of file names to lazy-load into the engine, needed by the entry before running it
     * @returns {Map} Under the key 'html' (KEY_HTML), naked rendered HTML if successful. Under the key 'error' (KEY_ERROR), error message if failed.
     */
    public Map<String, String> renderLazy(String entryName, String props, String dependencyNames) {

        LOG.info("---------------------------------------\n\n\n\nrenderLazy - START:");
        LOG.info("renderLazy - entryName: " + entryName);
        LOG.info("renderLazy - dependencyNames: " + dependencyNames);

        try {
            LinkedList<String> runnableAssetNames = getRunnableAssetNames(entryName, dependencyNames);
            loadAssets(runnableAssetNames);
            Map<String, String> rendered = runSSR(entryName, props, runnableAssetNames);
                                                                                                                        LOG.info("Rendered HTML:");
                                                                                                                        LOG.info(rendered.get(KEY_HTML));
                                                                                                                        LOG.info("---------------------- renderLazy - the end.\n\n\n\n");
            return rendered;

        } catch (Exception e) {
            e.printStackTrace();
                                                                                                                        LOG.info("---------------------- renderLazy - I dieded.\n\n\n\n");
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
