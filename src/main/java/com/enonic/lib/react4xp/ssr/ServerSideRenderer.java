package com.enonic.lib.react4xp.ssr;

import jdk.nashorn.api.scripting.NashornScriptEngine;
import jdk.nashorn.api.scripting.ScriptObjectMirror;
import org.apache.commons.lang.StringEscapeUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.script.ScriptException;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;


public class ServerSideRenderer {
    private final static Logger LOG = LoggerFactory.getLogger( ServerSideRenderer.class );

    private static String SCRIPTS_HOME = null;
    private static String LIBRARY_NAME = null;
    private static String CHUNKFILES_HOME = null;
    private static String NASHORNPOLYFILLS_FILENAME = null;
    private static String ENTRIESSOURCE = null;
    private static String COMPONENT_STATS_FILENAME = null;

    Set<String> componentScripts = new HashSet<>();

    private static final ArrayList<String> CHUNKSSOURCES = new ArrayList<>();


    public void setConfig(String SCRIPTS_HOME, String LIBRARY_NAME, String CHUNKFILES_HOME, String NASHORNPOLYFILLS_FILENAME, String ENTRIESSOURCE, String EXTERNALS_CHUNKS_FILENAME, String COMPONENT_STATS_FILENAME) throws IOException, ScriptException {
        ServerSideRenderer.NASHORNPOLYFILLS_FILENAME = NASHORNPOLYFILLS_FILENAME;   // "nashornPolyfills.js";
        ServerSideRenderer.ENTRIESSOURCE = ENTRIESSOURCE;                           // "entries.json";
        ServerSideRenderer.SCRIPTS_HOME = SCRIPTS_HOME;                             // "/react4xp"
        ServerSideRenderer.LIBRARY_NAME = LIBRARY_NAME;                             // "React4xp"
        ServerSideRenderer.CHUNKFILES_HOME = CHUNKFILES_HOME;                       // "/react4xp/"
        ServerSideRenderer.COMPONENT_STATS_FILENAME = COMPONENT_STATS_FILENAME;     // "stats.components.json"

        // Component chunks
        ServerSideRenderer.CHUNKSSOURCES.add(EXTERNALS_CHUNKS_FILENAME);            // "chunks.externals.json"

        // Init the engine too
        EngineFactory.getEngine(CHUNKFILES_HOME, NASHORNPOLYFILLS_FILENAME, ENTRIESSOURCE, COMPONENT_STATS_FILENAME, CHUNKSSOURCES);
    }

    // Examples:
    // component: name of a transpiled JSX component, i.e. path under /react4xp/, e.g: "site/parts/simple-reactive/simple-reactive"
    // props: valid stringified JSON on props object, e.g. '{"insertedMessage": "this is a prop!"}'
    public String renderToString(String component, String props) throws IOException, ScriptException {

        NashornScriptEngine engine = EngineFactory.getEngine(CHUNKFILES_HOME, NASHORNPOLYFILLS_FILENAME, ENTRIESSOURCE, COMPONENT_STATS_FILENAME, CHUNKSSOURCES);

        StringBuilder script = new StringBuilder();
        try {
            if (!componentScripts.contains(component)) {
                LOG.debug("Initializing component: " + component);
                String componentScript = ResourceHandler.readResource(SCRIPTS_HOME + "/" + component + ".js");
                componentScripts.add(component);
                script.append(componentScript);
            }
            script.append("var obj = { rendered: ReactDOMServer.renderToString(" + LIBRARY_NAME + "['" + component + "'].default(" + props + ")) };");
            script.append("obj;");

            ScriptObjectMirror obj = (ScriptObjectMirror)engine.eval(script.toString());

            return (String)obj.get("rendered");

        } catch (ScriptException e) {
            LOG.error("ERROR: " + ServerSideRenderer.class.getName() + ".renderToString:\n" +
                    "Message: " + e.getMessage() + "\n" +
                    "Component: " + component + "\n" +
                    "Props: " + props + "\n" +
                    "Script:\n---------------------------------\n\n" + script.toString() + "\n\n---------------------------------------", e);

            componentScripts.remove(component);
            engine.eval("delete " + LIBRARY_NAME + "['" + component + "']");

            return "<div class=\"react4xp-error\" style=\"border: 1px solid #8B0000; padding: 15px; background-color: #FFB6C1\">" +
                    "<h2>" + StringEscapeUtils.escapeHtml(e.getClass().getName()) + "</h2>" +
                    "<p class=\"react4xp-component-name\">" + component + "</p>" +
                    "<p class=\"react4xp-error-message\">" + StringEscapeUtils.escapeHtml(e.getMessage()) + "</p>" +
                    "</div>";
        }
    }
}
