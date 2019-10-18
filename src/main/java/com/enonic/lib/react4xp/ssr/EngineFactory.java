package com.enonic.lib.react4xp.ssr;

import jdk.nashorn.api.scripting.NashornScriptEngine;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.script.ScriptEngineManager;
import javax.script.ScriptException;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.LinkedList;

public class EngineFactory {
    private final static Logger LOG = LoggerFactory.getLogger( EngineFactory.class );

    // Basic-level polyfills. For some reason, this must be run from here, not from nashornPolyfills.js.
    private final static String POLYFILL_BASICS = "" +
            "if (typeof exports === 'undefined') { var exports = {}; }\n" +
            "if (typeof global === 'undefined') { var global = this; }\n" +
            "if (typeof window === 'undefined') { var window = this; }\n" +
            "if (typeof process === 'undefined') { var process = {env:{}}; }\n" +
            "if (typeof console === 'undefined') { " +
                "var console = {};" +
                "console.debug = print;\n" +
                "console.log = print;\n" +
                "console.warn = print;\n" +
                "console.error = print;" +
            "}";

    private static ArrayList<String> CHUNKS_SOURCES = null;
    private static String ENTRIES_SOURCE = null;

    private static NashornScriptEngine engineInstance = null;

    private static void setConfig(String CHUNKFILES_HOME, String ENTRIES_SOURCEFILENAME, ArrayList<String> CHUNK_SOURCEFILENAMES) {
        ENTRIES_SOURCE = CHUNKFILES_HOME + ENTRIES_SOURCEFILENAME;
        CHUNKS_SOURCES = new ArrayList<>();
        for (String chunkFileName : CHUNK_SOURCEFILENAMES) {
            CHUNKS_SOURCES.add(CHUNKFILES_HOME + chunkFileName);
        }
    }

    /** CHUNK_SOURCEFILES is a list of files (filename only, expected to be found in CHUNKFILES_HOME alongside the entries file)
     * that each describe one or several bundle/chunk asset file names, used to generate
     * a full list of dependency files, since the file names are hashed by webpack.
     * Sequence matters! These engine initialization scripts are run in this order.
     * Scripts found in chunks.json depend on the previous and must be the last!
     * nashornPolyfills.js script is the basic dependency, and will be added at the very beginning
     * outside of this list. */
    public static NashornScriptEngine getEngine(String CHUNKFILES_HOME, String NASHORNPOLYFILLS_FILENAME, String ENTRIES_SOURCEFILENAME, String COMPONENT_STATS_FILENAME, ArrayList<String> CHUNK_SOURCEFILENAMES) throws IOException, ScriptException {
        if (engineInstance == null) {

            setConfig(CHUNKFILES_HOME, ENTRIES_SOURCEFILENAME, CHUNK_SOURCEFILENAMES);

            // Sequence matters! Use ordered scriptList collection for iteration because hashmaps are not ordered!
            LinkedList<String> scriptList = new LinkedList<>();
            HashMap<String, String> scripts = new HashMap<>();

            scripts.put("POLYFILL_BASICS", POLYFILL_BASICS);
            scriptList.add("POLYFILL_BASICS");

            LinkedHashSet<String> transpiledDependencies = new ChunkDependencyParser().getScriptDependencyNames(CHUNKFILES_HOME + COMPONENT_STATS_FILENAME, CHUNKS_SOURCES, ENTRIES_SOURCE, true);

            Her skal NASHORNPOLYFILLS_FILENAME fortsatt slå inn hvis den eksisterer.
            Men skal kjøre uansett!

            try {
                if (NASHORNPOLYFILLS_FILENAME == null && NASHORNPOLYFILLS_FILENAME.trim() == "") {
                    throw new IllegalArgumentException("NASHORNPOLYFILLS_FILENAME is empty or missing.");
                }
                String file = CHUNKFILES_HOME + NASHORNPOLYFILLS_FILENAME;
                String content = ResourceHandler.readResource(file);
                scripts.put(file, content);
                scriptList.add(file);

            } catch (Exception e) {
                LOG.warn(e.getClass().getSimpleName() + " while trying to polyfill Nashorn for React4xp (NASHORNPOLYFILLS_FILENAME = " + NASHORNPOLYFILLS_FILENAME + "): " + e.getMessage());

                // Fallback: try to use the pre-built nashornPolyfills from react4xp-runtime-nashornpolyfills:
                String file = "/lib/enonic/react4xp/default/nashornPolyfills.js";
                String content = ResourceHandler.readResource(file);
                scripts.put(file, content);
                scriptList.add(file);
                LOG.warn("Fallback: using lib-react4xp's included polyfills (react4xp-runtime-nashornpolyfills)");
            }

            for (String scriptFile : transpiledDependencies) {
                String file = CHUNKFILES_HOME + scriptFile;
                scripts.put(file, ResourceHandler.readResource(file));
                scriptList.add(file);
            }

            StringBuilder script = new StringBuilder();

            String chunkLabel = null;
            String chunkScript = null;

            try {
                engineInstance = (NashornScriptEngine)new ScriptEngineManager().getEngineByName("nashorn");

                for (String scriptFile : scriptList) {
                    chunkLabel = scriptFile;
                    chunkScript = scripts.get(chunkLabel);
                    LOG.debug("Initializing ServerSideRenderer engine: " + chunkLabel);
                    script.append(chunkScript);
                }

                engineInstance.eval(script.toString());

            } catch (ScriptException bloatedError) {

                // Multiple scripts were chained together, then evaluated, then one failed.
                // Unravel which one failed in order to give a clear error message:
                try {
                    NashornScriptEngine tmpEngineInstance = (NashornScriptEngine)new ScriptEngineManager().getEngineByName("nashorn");
                    for (String scriptFile : scriptList) {
                        chunkLabel = scriptFile;
                        chunkScript = scripts.get(chunkLabel);
                        tmpEngineInstance.eval(chunkScript);
                    }

                } catch (ScriptException specificError) {
                    LOG.error("INIT SCRIPT FAILED (" + chunkLabel + "):\n---------------------------------\n\n" + chunkScript + "\n\n---------------------------------------");
                    throw specificError;
                }

                // Fallback if unravelling failed
                LOG.error("INIT SCRIPTS FAILED (script interaction?):\n---------------------------------\n\n" + script.toString() + "\n\n---------------------------------------");
                throw bloatedError;
            }
        }

        return engineInstance;
    }
}
