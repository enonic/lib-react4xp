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
import org.apache.commons.lang.StringEscapeUtils;
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
import java.util.Set;
import java.util.function.Supplier;


public class ServerSideRenderer implements ScriptBean {
    private final static Logger LOG = LoggerFactory.getLogger( ServerSideRenderer.class );

    // Constants. TODO: SHOULD BE final.
    private String SCRIPTS_HOME = null;
    private String LIBRARY_NAME = null;
    private String APP_NAME = null;
    private NashornScriptEngine ENGINE = null;
    private final boolean IS_PRODMODE = (RunMode.get() == RunMode.PROD);
    private Supplier<ResourceService> RESOURCE_SERVICE_SUPPLIER;

    private final Set<String> ALREADY_CACHEDANDRUN_ASSETNAMES = new HashSet<>();
    private final EngineFactory ENGINE_FACTORY = new EngineFactory();


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
            int cacheSize
    ) throws IOException, ScriptException {
        this.APP_NAME = APP_NAME;
        this.SCRIPTS_HOME = SCRIPTS_HOME;                             // "/react4xp"
        this.LIBRARY_NAME = LIBRARY_NAME;                             // "React4xp"

        synchronized(ENGINE_FACTORY) {
            // Component chunks
            ArrayList<String> chunkSources = new ArrayList<>();
            chunkSources.add(EXTERNALS_CHUNKS_FILENAME);                                // "chunks.externals.json" = react + react-dom

            // Init the engine too
            ENGINE = ENGINE_FACTORY.initEngine(
                    CHUNKFILES_HOME,
                    NASHORNPOLYFILLS_FILENAME,
                    ENTRIESSOURCE,
                    COMPONENT_STATS_FILENAME,
                    chunkSources,
                    lazyLoading,
                    cacheSize
            );
        }
    }

    ///////////////////////////////////////////////////////////////



    private void prepareScriptsFromAssets(List<String> assetNamesToLoad, StringBuilder scriptBuilder) throws IOException {
        for (String assetName : assetNamesToLoad) {
            prepareScriptFromAsset(assetName, scriptBuilder);
        }
    }

    private void prepareScriptFromAsset(String assetName, StringBuilder scriptBuilder) throws IOException {
        synchronized (ALREADY_CACHEDANDRUN_ASSETNAMES) {
            if (!IS_PRODMODE || !ALREADY_CACHEDANDRUN_ASSETNAMES.contains(assetName)) {

                String url = APP_NAME + ":" + SCRIPTS_HOME + "/" + assetName;
                LOG.info("Initializing asset: " + url);

                ResourceKey resourceKey = ResourceKey.from(url);
                Resource resource = RESOURCE_SERVICE_SUPPLIER.get().getResource(resourceKey);
                String componentScript = resource.getBytes().asCharSource(Charsets.UTF_8).read();

                if (IS_PRODMODE) {
                    ALREADY_CACHEDANDRUN_ASSETNAMES.add(assetName);
                }
                scriptBuilder.append(componentScript);
                scriptBuilder.append(";\n");
            }
        }
    }

    private String finalizeAndRender(String entry, String props, StringBuilder scriptBuilder) throws ScriptException {
        String script = null;
        try {
            scriptBuilder.append("var obj = { rendered: ReactDOMServer.renderToString(");
            scriptBuilder.append(LIBRARY_NAME);
            scriptBuilder.append("['");
            scriptBuilder.append(entry);
            scriptBuilder.append("'].default(");
            scriptBuilder.append(props);
            scriptBuilder.append(")) };obj;");

            script = scriptBuilder.toString();
            //LOG.info("#############          componentScript:\n\n\n" + script.toString() + "\n\n\n");

            ScriptObjectMirror obj = (ScriptObjectMirror)ENGINE.eval(script);

            return (String)obj.get("rendered");

        } catch (ScriptException e) {

            LOG.info("");
            LOG.info(entry + " script dump:");
            LOG.info("---------------------------------\n\n");
            LOG.info(script+"\n\n");
            LOG.info("---------------------------------------\n");
            LOG.error("...end of entry script: " + LIBRARY_NAME + "['" + entry + "']. Dumped to log because:");
            LOG.error("    ERROR (" + ServerSideRenderer.class.getName() + ".finalizeAndRender):");
            LOG.error("    Message: " + e.getMessage());
            LOG.error("    Props: " + props + "\n");
            LOG.info("SOLUTION TIPS: The previous error message tends to refer to lines in compiled/mangled code. The browser console might have more readable (and sourcemapped) information - especially if you clientside-render this page / entry instead. Add 'clientRender: true', etc - in XP's preview or live mode! A full (compiled) script is dumped to the log at debug level. Also, it sometimes helps to clear all cached behavior: stop continuous builds, clear/rebuild your project, restart the XP server, clear browser cache.\n\n", e);

            if (IS_PRODMODE) {
                synchronized (ALREADY_CACHEDANDRUN_ASSETNAMES) {
                    ALREADY_CACHEDANDRUN_ASSETNAMES.remove(entry);
                }
            }
            ENGINE.eval("delete " + LIBRARY_NAME + "['" + entry + "']");

            return "<div class=\"react4xp-error\" style=\"border: 1px solid #8B0000; padding: 15px; background-color: #FFB6C1\">" +
                    "<h2>" + StringEscapeUtils.escapeHtml(e.getClass().getName()) + "</h2>" +
                    "<p class=\"react4xp-entry-name\">" + entry + "</p>" +
                    "<p class=\"react4xp-error-message\">" + StringEscapeUtils.escapeHtml(e.getMessage()) + "</p>" +
                    "<script>console.error('" + StringEscapeUtils.escapeJavaScript(e.getMessage()).replace("'", "\"") +"\\n\\nFor more info: see the server log, and/or clientside-render this page/entry (" + entry + ") in XP preview or live mode.');</script>" +
                    "</div>";
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
    public String renderToString(String component, String props) throws IOException, ScriptException {
        StringBuilder scriptBuilder = new StringBuilder();
        prepareScriptFromAsset(component + ".js", scriptBuilder);
        return finalizeAndRender(component, props, scriptBuilder);
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
    public String renderToStringLazy(String entryName, String props, String dependencyNames) throws IOException, ScriptException {

        LinkedList<String> assetNamesToLoad = new LinkedList<>();
        if (dependencyNames != null && !"".equals(dependencyNames.trim())) {
            JSONArray array = new JSONArray(dependencyNames);
            Iterator<Object> it = array.iterator();
            while (it.hasNext()) {
                String assetName = (String)it.next();
                if (assetName.endsWith(".js")) {
                    assetNamesToLoad.add(assetName);
                }
            }
        }
        assetNamesToLoad.add(entryName + ".js");

        StringBuilder scriptBuilder = new StringBuilder();
        prepareScriptsFromAssets(assetNamesToLoad, scriptBuilder);
        return finalizeAndRender(entryName, props, scriptBuilder);
    }

    @Override
    public void initialize(BeanContext context) {
        this.RESOURCE_SERVICE_SUPPLIER = context.getService(ResourceService.class);
    }
}
