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

    private static String SCRIPTS_HOME = null;
    private static String LIBRARY_NAME = null;
    private static String APP_NAME = null;

    // TODO: Shouldn't be needed ever (aka: commenting it out shouldn't ever fail). Delete when this is confirmed.
    // private static String CHUNKFILES_HOME = null;
    // private static String NASHORNPOLYFILLS_FILENAME = null;
    // private static String ENTRIESSOURCE = null;
    // private static String COMPONENT_STATS_FILENAME = null;

    Set<String> alreadyCachedAndRunAssetNames = new HashSet<>();

    private static final ArrayList<String> CHUNKSSOURCES = new ArrayList<>();
    private static NashornScriptEngine ENGINE = null;
    private Supplier<ResourceService> resourceServiceSupplier;

    private static RunMode runMode = RunMode.get();

    public void setConfig(
            String APP_NAME,
            String SCRIPTS_HOME,
            String LIBRARY_NAME,
            String CHUNKFILES_HOME,
            String NASHORNPOLYFILLS_FILENAME,
            String ENTRIESSOURCE,
            String EXTERNALS_CHUNKS_FILENAME,
            String COMPONENT_STATS_FILENAME,
            boolean lazyLoading
    ) throws IOException, ScriptException {
        ServerSideRenderer.APP_NAME = APP_NAME;
        ServerSideRenderer.SCRIPTS_HOME = SCRIPTS_HOME;                             // "/react4xp"
        ServerSideRenderer.LIBRARY_NAME = LIBRARY_NAME;                             // "React4xp"

        // TODO: Shouldn't be needed ever (aka: commenting it out shouldn't ever fail). Delete when this is confirmed.
        // ServerSideRenderer.NASHORNPOLYFILLS_FILENAME = NASHORNPOLYFILLS_FILENAME;   // "nashornPolyfills.js";
        // ServerSideRenderer.ENTRIESSOURCE = ENTRIESSOURCE;                           // "entries.json";
        // ServerSideRenderer.CHUNKFILES_HOME = CHUNKFILES_HOME;                       // "/react4xp/"
        // ServerSideRenderer.COMPONENT_STATS_FILENAME = COMPONENT_STATS_FILENAME;     // "stats.components.json"

        // Component chunks
        ServerSideRenderer.CHUNKSSOURCES.add(EXTERNALS_CHUNKS_FILENAME);            // "chunks.externals.json"

        // Init the engine too
        ENGINE = EngineFactory.initEngine(
                CHUNKFILES_HOME,
                NASHORNPOLYFILLS_FILENAME,
                ENTRIESSOURCE,
                COMPONENT_STATS_FILENAME,
                ServerSideRenderer.CHUNKSSOURCES,
                lazyLoading
        );
    }

    ///////////////////////////////////////////////////////////////



    private void prepareScriptsFromAssets(List<String> assetNamesToLoad, StringBuilder scriptBuilder) throws IOException {
        for (String assetName : assetNamesToLoad) {
            prepareScriptFromAsset(assetName, scriptBuilder);
        }
    }

    private void prepareScriptFromAsset(String assetName, StringBuilder scriptBuilder) throws IOException {
        if (!alreadyCachedAndRunAssetNames.contains(assetName)) {
            LOG.info("Initializing asset: " + assetName);

            String url = APP_NAME + ":" + SCRIPTS_HOME + "/" + assetName;
            ResourceKey resourceKey = ResourceKey.from(url);
            Resource resource = resourceServiceSupplier.get().getResource(resourceKey);
            String componentScript = resource.getBytes().asCharSource(Charsets.UTF_8).read();

            if (runMode == RunMode.PROD) {
                alreadyCachedAndRunAssetNames.add(assetName);
            }
            scriptBuilder.append(componentScript);
            scriptBuilder.append(";\n");
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

            LOG.debug("");
            LOG.debug(entry + " script dump:");
            LOG.debug("---------------------------------\n\n");
            LOG.debug(script+"\n\n");
            LOG.debug("---------------------------------------\n");
            LOG.error("ERROR: " + ServerSideRenderer.class.getName() + ".renderToString  |  " +
                    "Message: " + e.getMessage() + "  |  " +
                    "Entry: " + entry + "  |  " +
                    "Props: " + props + "\n");
            LOG.info("TIP: The previous error message tends to refer to compiled/mangled lines and code. The browser console might have more readable (and sourcemapped) information - especially if you clientside-render this page / entry instead. Add 'clientRender: true', etc - in XP's preview or live mode! A full (compiled) script is dumped to the log at debug level.\n\n", e);

            if (runMode == RunMode.PROD) {
                alreadyCachedAndRunAssetNames.remove(entry);
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
        this.resourceServiceSupplier = context.getService(ResourceService.class);
    }
}
