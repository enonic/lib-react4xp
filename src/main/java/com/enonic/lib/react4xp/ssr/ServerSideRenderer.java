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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.script.ScriptException;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashSet;
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

    Set<String> componentScripts = new HashSet<>();

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

    // Examples:
    // component: name of a transpiled JSX component, i.e. path under /react4xp/, e.g: "site/parts/simple-reactive/simple-reactive"
    // props: valid stringified JSON on props object, e.g. '{"insertedMessage": "this is a prop!"}'
    public String renderToString(String component, String props) throws IOException, ScriptException {

        // TODO: Shouldn't be needed ever (aka: commenting it out shouldn't ever fail). Delete when this is confirmed.
        // NashornScriptEngine engine = EngineFactory.initEngine(CHUNKFILES_HOME, NASHORNPOLYFILLS_FILENAME, ENTRIESSOURCE, COMPONENT_STATS_FILENAME, CHUNKSSOURCES);

        String script = null;
        StringBuilder scriptBuilder = new StringBuilder();
        try {
            if (!componentScripts.contains(component)) {
                LOG.debug("Initializing component: " + component);

                String url = APP_NAME + ":" + SCRIPTS_HOME + "/" + component + ".js";
                ResourceKey resourceKey = ResourceKey.from(url);
                Resource resource = resourceServiceSupplier.get().getResource(resourceKey);
                String componentScript = resource.getBytes().asCharSource(Charsets.UTF_8).read();

                if (runMode == RunMode.PROD) {
                    componentScripts.add(component);
                }
                scriptBuilder.append(componentScript);
                scriptBuilder.append(";\n");
            }

            scriptBuilder.append("var obj = { rendered: ReactDOMServer.renderToString(");
            scriptBuilder.append(LIBRARY_NAME);
            scriptBuilder.append("['");
            scriptBuilder.append(component);
            scriptBuilder.append("'].default(");
            scriptBuilder.append(props);
            scriptBuilder.append(")) };obj;");

            script = scriptBuilder.toString();
            //LOG.info("#############          componentScript:\n\n\n" + script.toString() + "\n\n\n");

            ScriptObjectMirror obj = (ScriptObjectMirror)ENGINE.eval(script);

            return (String)obj.get("rendered");

        } catch (ScriptException e) {
            LOG.error("ERROR: " + ServerSideRenderer.class.getName() + ".renderToString  |  " +
                    "Message: " + e.getMessage() + "  |  " +
                    "Component: " + component + "  |  " +
                    "Props: " + props + "\n" +
                    "Script:\n---------------------------------\n\n" + script + "\n\n---------------------------------------", e);

            if (runMode == RunMode.PROD) {
                componentScripts.remove(component);
            }
            ENGINE.eval("delete " + LIBRARY_NAME + "['" + component + "']");

            return "<div class=\"react4xp-error\" style=\"border: 1px solid #8B0000; padding: 15px; background-color: #FFB6C1\">" +
                    "<h2>" + StringEscapeUtils.escapeHtml(e.getClass().getName()) + "</h2>" +
                    "<p class=\"react4xp-component-name\">" + component + "</p>" +
                    "<p class=\"react4xp-error-message\">" + StringEscapeUtils.escapeHtml(e.getMessage()) + "</p>" +
                    "</div>";
        }
    }

    @Override
    public void initialize(BeanContext context) {
        this.resourceServiceSupplier = context.getService(ResourceService.class);
    }
}
