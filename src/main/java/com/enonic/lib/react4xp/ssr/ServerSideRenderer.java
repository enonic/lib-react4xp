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
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Supplier;


public class ServerSideRenderer implements ScriptBean {
    private final static Logger LOG = LoggerFactory.getLogger( ServerSideRenderer.class );

    private static final boolean IS_PRODMODE = (RunMode.get() == RunMode.PROD);
    private static final Set<String> ALREADY_CACHEDANDRUN_ASSETNAMES = new HashSet<>();
    private static final EngineFactory ENGINE_FACTORY = new EngineFactory();

    private static final String KEY_HTML = "html";
    private static final String KEY_ERROR = "error";

    // Constants. TODO: SHOULD BE final.
    private String SCRIPTS_HOME = null;
    private String LIBRARY_NAME = null;
    private String APP_NAME = null;
    private NashornScriptEngine ENGINE = null;
    private Supplier<ResourceService> RESOURCE_SERVICE_SUPPLIER;



    public void setConfig(
            String APP_NAME,
            String SCRIPTS_HOME,
            String LIBRARY_NAME,
            String CHUNKFILES_HOME,
            String NASHORNPOLYFILLS_FILENAME,
            String ENTRIESSOURCE,
            String EXTERNALS_CHUNKS_FILENAME,
            String COMPONENT_STATS_FILENAME,
            boolean lazyLoading,
            String[] scriptEngineSettings
    ) throws IOException, ScriptException {
        LOG.info("");
        LOG.info("---- ServerSideRenderer.setConfig: " + this.hashCode());
        LOG.info("  APP_NAME: " + APP_NAME);
        LOG.info("  SCRIPTS_HOME: " + SCRIPTS_HOME);
        LOG.info("  LIBRARY_NAME: " + LIBRARY_NAME);
        LOG.info("  CHUNKFILES_HOME: " + CHUNKFILES_HOME);
        LOG.info("  NASHORNPOLYFILLS_FILENAME: " + NASHORNPOLYFILLS_FILENAME);
        LOG.info("  ENTRIESSOURCE: " + ENTRIESSOURCE);
        LOG.info("  EXTERNALS_CHUNKS_FILENAME: " + EXTERNALS_CHUNKS_FILENAME);
        LOG.info("  COMPONENT_STATS_FILENAME: " + COMPONENT_STATS_FILENAME);
        LOG.info("  lazyLoading: " + lazyLoading);
        LOG.info("  scriptEngineSettings: " + scriptEngineSettings);
        LOG.info("");

        this.APP_NAME = APP_NAME;
        this.SCRIPTS_HOME = SCRIPTS_HOME;                             // "/react4xp"
        this.LIBRARY_NAME = LIBRARY_NAME;                             // "React4xp"

        // Component chunks
        ArrayList<String> chunkSources = new ArrayList<>();

        LOG.info("Adding EXTERNALS_CHUNKS_FILENAME to chunkSources: " + EXTERNALS_CHUNKS_FILENAME);
        chunkSources.add(EXTERNALS_CHUNKS_FILENAME);                                // "chunks.externals.json" = react + react-dom

        // Init the engine too
        ENGINE = ENGINE_FACTORY.initEngine(
                CHUNKFILES_HOME,
                NASHORNPOLYFILLS_FILENAME,
                ENTRIESSOURCE,
                COMPONENT_STATS_FILENAME,
                chunkSources,
                lazyLoading,
                scriptEngineSettings
        );
        LOG.info("Got SSR ENGINE: " + ENGINE.hashCode());

        LOG.info("---- /ServerSideRenderer.Setconfig " + this.hashCode());

    }

    ///////////////////////////////////////////////////////////////



    private String prepareCodeFromAssets(List<String> assetNamesToLoad) throws IOException {
        StringBuilder scriptBuilder = new StringBuilder();
        for (String assetName : assetNamesToLoad) {
            appendScriptFromAsset(assetName, scriptBuilder);
        }
        return scriptBuilder.toString();
    }

    private boolean assetIsProdCachedInNashorn(String assetName) {
        boolean assetIsProdCachedInNashorn = IS_PRODMODE && ALREADY_CACHEDANDRUN_ASSETNAMES.contains(assetName);
        LOG.info("assetIsProdCachedInNashorn('" + assetName + "')? " + assetIsProdCachedInNashorn);
        return assetIsProdCachedInNashorn;
    }

    private void appendScriptFromAsset(String assetName, StringBuilder codeBuilder) throws IOException {
        synchronized (ALREADY_CACHEDANDRUN_ASSETNAMES) {
            LOG.info("prepareScriptFromAsset - ALREADY_CACHEDANDRUN_ASSETNAMES.contains(" + assetName + ") ? " + ALREADY_CACHEDANDRUN_ASSETNAMES.contains(assetName));
            if (!assetIsProdCachedInNashorn(assetName)) {

                String url = APP_NAME + ":" + SCRIPTS_HOME + "/" + assetName;
                LOG.info("Adding asset: " + url);

                ResourceKey resourceKey = ResourceKey.from(url);
                Resource resource = RESOURCE_SERVICE_SUPPLIER.get().getResource(resourceKey);
                String componentScript = resource.getBytes().asCharSource(Charsets.UTF_8).read();

                if (IS_PRODMODE) {
                    ALREADY_CACHEDANDRUN_ASSETNAMES.add(assetName);
                    LOG.info("Added " + assetName + ". Now: ALREADY_CACHEDANDRUN_ASSETNAMES: " + ALREADY_CACHEDANDRUN_ASSETNAMES);
                }
                codeBuilder.append(componentScript);
                codeBuilder.append(";\n");
                LOG.info("   Asset added: " + url);
            }
        }
    }

    private Map<String, String> finalizeAndRender(String entry, String props, String code, LinkedList<String> assetsInvolved) throws ScriptException {

        String callScript = "var obj = { " +
                KEY_HTML + ": ReactDOMServer.renderToString(" + LIBRARY_NAME  + "['" + entry + "'].default(" + props  + ")) " +
                "};" +
                "obj;";

        //Timer timer = new Timer();
        //timer.g

        String runnable;
        if (code != null && !"".equals(code.trim())) {
            if (assetsInvolved != null) {
                LOG.info("finalizeAndRender - first-time rendering assets: " + assetsInvolved);
            } else {
                LOG.info("finalizeAndRender - first-time rendering entry: " + entry);
            }
            runnable = code + callScript;

        } else {
            runnable = callScript;
        }

        LOG.info("finalizeAndRender - call: " + callScript);
        //LOG.info("#############          componentScript:\n\n\n" + script.toString() + "\n\n\n");

        try {
            ScriptObjectMirror obj = (ScriptObjectMirror)ENGINE.eval(runnable);

            String rendered = (String)obj.get(KEY_HTML);
            LOG.info("finalizeAndRender - " + KEY_HTML + ": " + entry);

            return Map.of(
                    KEY_HTML,
                    rendered
            );

        } catch (ScriptException e) {
            LOG.info("");
            LOG.info(entry + " code dump:");
            LOG.info("---------------------------------\n\n");
            LOG.info(runnable+"\n\n");
            LOG.info("---------------------------------------\n");
            LOG.error("...end of entry script: " + LIBRARY_NAME + "['" + entry + "']. Dumped to log because:");
            LOG.error("    ERROR (" + ServerSideRenderer.class.getName() + ".finalizeAndRender):");
            LOG.error("    Props: " + props + "\n");
            LOG.error("SOLUTION TIPS: The previous error message tends to refer to lines in compiled/mangled code. The browser console might have more readable (and sourcemapped) information - especially if you clientside-render this page / entry instead. Add 'clientRender: true', etc - in XP's preview or live mode! A full (compiled) script is dumped to the log at debug level. Also, it sometimes helps to clear all cached behavior: stop continuous builds, clear/rebuild your project, restart the XP server, clear browser cache.\n\n");
            e.printStackTrace();

            if (IS_PRODMODE) {
                synchronized (ALREADY_CACHEDANDRUN_ASSETNAMES) {
                    if (assetsInvolved != null) {
                        LOG.info("finalizeAndRender - assetsInvolved: " + assetsInvolved);
                        for (String asset : assetsInvolved) {
                            LOG.info("finalizeAndRender - removing asset from ALREADY_CACHEDANDRUN_ASSETNAMES: " + asset);
                            ALREADY_CACHEDANDRUN_ASSETNAMES.remove(asset);
                        }
                    } else {
                        LOG.info("finalizeAndRender - removing entry asset from ALREADY_CACHEDANDRUN_ASSETNAMES: " + entry);
                        ALREADY_CACHEDANDRUN_ASSETNAMES.remove(entry);
                    }
                    LOG.info("finalizeAndRender - ALREADY_CACHEDANDRUN_ASSETNAMES now: " + ALREADY_CACHEDANDRUN_ASSETNAMES);
                }
            }
            LOG.info("finalizeAndRender - deleting " + LIBRARY_NAME + "['" + entry + "'] from engine");
            ENGINE.eval("delete " + LIBRARY_NAME + "['" + entry + "']");

            return Map.of(
                    KEY_ERROR, e.getClass().getName() + ": " + e.getMessage() /*,
                    KEY_HTML,
                    "<div class=\"react4xp-error\" style=\"font-family:monospace; border: 1px solid #8B0000; padding: 15px; background-color: #FFB6C1\">" +
                    "<h2>" + StringEscapeUtils.escapeHtml(e.getClass().getName()) + "</h2>" +
                    "<p class=\"react4xp-entry-name\">" + entry + "</p>" +
                    "<p class=\"react4xp-error-message\">" + StringEscapeUtils.escapeHtml(e.getMessage()) + "</p>" +
                    "</div>"*/
            );
        }
    }


    ///////////////////////////////////////////////////////

    /**
     * Renders an entry to an HTML string.
     * @param component name of a transpiled JSX component, i.e. jsxPath: the filextension-less path to the compiled entry asset under assets/react4xp/, e.g: "site/parts/simple-reactive/simple-reactive"
     * @param props valid stringified JSON on props object, e.g. '{"insertedMessage": "this is a prop!"}'
     * @return HTML string
     * @throws IOException
     * @throws ScriptException
     */
    public Map<String, String> render(String component, String props) throws IOException, ScriptException {
        StringBuilder codeBuilder = new StringBuilder();
        appendScriptFromAsset(component + ".js", codeBuilder);
        return finalizeAndRender(component, props, codeBuilder.toString(), null);
    }

    /**
     * Same as renderToString, but only used when the engine has been initialized (setConfig) with lazyLoading = true
     * @param entryName name of a transpiled JSX component, i.e. jsxPath: the filextension-less path to the compiled entry asset under assets/react4xp/, e.g: "site/parts/simple-reactive/simple-reactive"
     * @param props valid stringified JSON object: the entry's react props, e.g. '{"insertedMessage": "this is a prop!"}'
     * @param dependencyNames valid stringified JSON array: a set of file names to lazy-load into the engine, needed by the entry before running it
     * @return HTML string
     * @throws IOException
     * @throws ScriptException
     */
    public Map<String, String> renderLazy(String entryName, String props, String dependencyNames) throws IOException, ScriptException {

        LOG.info("\n\n\n\nrenderLazy - START:");
        LOG.info("renderLazy - entryName: " + entryName);
        LOG.info("renderLazy - dependencyNames: " + dependencyNames);

        try {
            LinkedList<String> assetNamesToLoad = new LinkedList<>();
            LinkedList<String> allAssetsInvolved = new LinkedList<>();

            if (dependencyNames != null && !"".equals(dependencyNames.trim())) {
                JSONArray array = new JSONArray(dependencyNames);
                Iterator<Object> it = array.iterator();
                while (it.hasNext()) {
                    String assetName = (String) it.next();
                    if (assetName.endsWith(".js")) {
                        allAssetsInvolved.add(assetName);
                        if (!assetIsProdCachedInNashorn(assetName)) {
                            assetNamesToLoad.add(assetName);
                        }
                    }
                }
            }
            String fullEntryName = entryName + ".js";
            allAssetsInvolved.add(fullEntryName);
            if (!assetIsProdCachedInNashorn(fullEntryName)) {
                assetNamesToLoad.add(fullEntryName);
            }

            String code = prepareCodeFromAssets(assetNamesToLoad);
            Map<String, String> rendered = finalizeAndRender(entryName, props, code, allAssetsInvolved);
                                                                                                                        LOG.info("---------------------- renderLazy - the end.\n\n\n");
            return rendered;

        } catch (Exception e) {
            e.printStackTrace();
                                                                                                                        LOG.info("---------------------- renderLazy - I dieded.\n\n\n");
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
