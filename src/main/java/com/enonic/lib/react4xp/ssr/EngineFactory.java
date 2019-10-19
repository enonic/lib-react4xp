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
    // TODO: shouldn't be a string here, but read from a JS file, preferrably in the react4xp-runtime-nashornpolyfills package.
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

    private static void configEngine(String CHUNKFILES_HOME, String ENTRIES_SOURCEFILENAME, ArrayList<String> CHUNK_SOURCEFILENAMES) {
        ENTRIES_SOURCE = CHUNKFILES_HOME + ENTRIES_SOURCEFILENAME;
        CHUNKS_SOURCES = new ArrayList<>();
        for (String chunkFileName : CHUNK_SOURCEFILENAMES) {
            CHUNKS_SOURCES.add(CHUNKFILES_HOME + chunkFileName);
        }
    }


    private static void addNashornPolyfillScripts(String CHUNKFILES_HOME, String NASHORNPOLYFILLS_FILENAME, LinkedList<String> scriptNames, HashMap<String, String> scriptsByName) {
        // Add the most basic nashorn polyfill first
        scriptsByName.put("POLYFILL_BASICS", POLYFILL_BASICS);
        scriptNames.add("POLYFILL_BASICS");

        // Next, try to add the default nashornPolyfills, pre-built from react4xp-runtime-nashornpolyfills:
        try {
            // ('build/resources/main' + defaultPolyfillFileName) must match (env.BUILD_R4X + env.NASHORNPOLYFILLS_FILENAME)
            // in the nashornPolyfills task in build.gradle!
            String defaultPolyfillFileName = "/lib/enonic/react4xp/default/nashornPolyfills.js";

            String content = ResourceHandler.readResource(defaultPolyfillFileName);
            scriptsByName.put(defaultPolyfillFileName, content);
            scriptNames.add(defaultPolyfillFileName);
        } catch (Exception e) {
            LOG.error(e.getClass().getSimpleName() + " while fetching the pre-built default nashorn polyfill for React4xp (build/resources/main/lib/enonic/react4xp/default/nashornPolyfills.js): " + e.getMessage());
        }

        // Next, if the user has added any extra polyfills, the filename will be in NASHORNPOLYFILLS_FILENAME:
        if (NASHORNPOLYFILLS_FILENAME != null && !"".equals(NASHORNPOLYFILLS_FILENAME)) {
            try {
                String file = CHUNKFILES_HOME + NASHORNPOLYFILLS_FILENAME;
                String content = ResourceHandler.readResource(file);
                scriptsByName.put(file, content);
                scriptNames.add(file);

            } catch (Exception e) {
                LOG.warn(e.getClass().getSimpleName() + " while trying to add custom nashorn polyfill for React4xp (NASHORNPOLYFILLS_FILENAME = " + NASHORNPOLYFILLS_FILENAME + "): " + e.getMessage());
            }
        } else {
            LOG.info("No custom nashorn polyfills (NASHORNPOLYFILLS_FILENAME = "+ NASHORNPOLYFILLS_FILENAME + " ). This is usually fine, proceeding without.");
        }
    }


    private static void addEntriesAndChunksScripts(String CHUNKFILES_HOME, String COMPONENT_STATS_FILENAME, LinkedList<String> scriptNames, HashMap<String, String> scriptsByName) throws IOException {
        LinkedHashSet<String> transpiledDependencies = new ChunkDependencyParser().getScriptDependencyNames(CHUNKFILES_HOME + COMPONENT_STATS_FILENAME, CHUNKS_SOURCES, ENTRIES_SOURCE, true);

        for (String scriptFile : transpiledDependencies) {
            String file = CHUNKFILES_HOME + scriptFile;
            scriptsByName.put(file, ResourceHandler.readResource(file));
            scriptNames.add(file);
        }
    }


    private static String buildFullScript(LinkedList<String> scriptNames, HashMap<String, String> scriptsByName) {
        StringBuilder fullScript = new StringBuilder();
        for (String scriptName : scriptNames) {
            LOG.debug("Initializing ServerSideRenderer engine: " + scriptName);
            String partialScript = scriptsByName.get(scriptName);
            fullScript.append(partialScript);
        }
        return fullScript.toString();
    }


    // Multiple scripts were chained together, then evaluated, but one has failed.
    // The error is probably excessive and not very precise, since ALL the scripts were evaluated together the first time - hence "bloatedError".
    // Try to unravel which one(s) failed in order to give a clearer error message:
    private static void handleScriptErrors(ScriptException bloatedError, LinkedList<String> scriptNames, HashMap<String, String> scriptsByName, String fullScript) throws ScriptException {
        NashornScriptEngine tmpEngineInstance = (NashornScriptEngine)new ScriptEngineManager().getEngineByName("nashorn");
        int failureCount = 0;
        ScriptException errorToThrow = null;

        for (String scriptName : scriptNames) {
            String partialScript = null;
            try {
                partialScript = scriptsByName.get(scriptName);
                tmpEngineInstance.eval(partialScript);
            } catch (ScriptException specificError) {
                failureCount++;
                LOG.error("INIT SCRIPT FAILURE #" + failureCount + " (" + scriptName + ":" + specificError.getLineNumber() + ") - " + specificError.getClass().getName() + ": " + specificError.getMessage() + "\n---------------------------------\n\n" + partialScript + "\n\n---------------------------------------");
                if (errorToThrow == null) {
                    errorToThrow = specificError;
                }
            }
        }

        if (errorToThrow == null) {
            // Fallback if unravelling failed
            LOG.error("INIT SCRIPTS FAILURE: script interaction? Full init script, line " + bloatedError.getLineNumber() + " - " + bloatedError.getClass().getName() + ": " + bloatedError.getMessage() + "\n---------------------------------\n\n" + fullScript + "\n\n---------------------------------------");
            throw bloatedError;

        } else {
            LOG.error(failureCount + " script error(s) were logged (see above). Details from #1:");
            throw errorToThrow;
        }
    }


    private static void runScripts(LinkedList<String> scriptNames, HashMap<String, String> scriptsByName) throws ScriptException {
        String fullScript = buildFullScript(scriptNames, scriptsByName);

        try {
            engineInstance = (NashornScriptEngine)new ScriptEngineManager().getEngineByName("nashorn");
            engineInstance.eval(fullScript);

        } catch (ScriptException bloatedError) {
            handleScriptErrors(bloatedError, scriptNames, scriptsByName, fullScript);
        }
    }


    /** MAIN ENTRY.
     * CHUNK_SOURCEFILES is a list of files (filename only, expected to be found in CHUNKFILES_HOME alongside the entries file)
     * that each describe one or several bundle/chunk asset file names, used to generate
     * a full list of dependency files, since the file names are hashed by webpack.
     * Sequence matters! These engine initialization scripts are run in this order.
     * Scripts found in chunks.json depend on the previous and must be the last!
     * nashornPolyfills.js script is the basic dependency, and will be added at the very beginning
     * outside of this list. */
    public static NashornScriptEngine initEngine(String CHUNKFILES_HOME, String NASHORNPOLYFILLS_FILENAME, String ENTRIES_SOURCEFILENAME, String COMPONENT_STATS_FILENAME, ArrayList<String> CHUNK_SOURCEFILENAMES) throws IOException, ScriptException {
        if (engineInstance == null) {

            configEngine(CHUNKFILES_HOME, ENTRIES_SOURCEFILENAME, CHUNK_SOURCEFILENAMES);

            // Sequence matters, but hashmaps are not ordered! Use ordered scriptList collection 'scriptNames' for iteration!
            LinkedList<String> scriptNames = new LinkedList<>();
            HashMap<String, String> scriptsByName = new HashMap<>();

            addNashornPolyfillScripts(CHUNKFILES_HOME, NASHORNPOLYFILLS_FILENAME, scriptNames, scriptsByName);

            addEntriesAndChunksScripts(CHUNKFILES_HOME, COMPONENT_STATS_FILENAME, scriptNames, scriptsByName);

            runScripts(scriptNames, scriptsByName);
        }

        return engineInstance;
    }
}
