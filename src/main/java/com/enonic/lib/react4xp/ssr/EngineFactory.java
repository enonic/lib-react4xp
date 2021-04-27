package com.enonic.lib.react4xp.ssr;

import jdk.nashorn.api.scripting.NashornScriptEngine;
import jdk.nashorn.api.scripting.NashornScriptEngineFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.script.ScriptEngineManager;
import javax.script.ScriptException;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedList;

public class EngineFactory {
    private final static Logger LOG = LoggerFactory.getLogger( EngineFactory.class );

    private NashornScriptEngine ENGINE = null;

    // Basic-level polyfills. For some reason, this must be run from here, not from nashornPolyfills.js.
    // TODO: shouldn't be a string here, but read from a JS file, preferrably in the react4xp-runtime-nashornpolyfills package.
    private final String POLYFILL_BASICS = "" +
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


    private HashMap<String, Boolean> scriptHasBeenLoadedByName = null;
    private boolean engineIsInitialized = false;

    private void initBasicSettings(
            String CHUNKFILES_HOME,
            String ENTRIES_SOURCEFILENAME,
            ArrayList<String> CHUNK_SOURCEFILENAMES
    ) {


    }


    private void prepareNashornPolyfillScripts(String CHUNKFILES_HOME, String NASHORNPOLYFILLS_FILENAME, LinkedList<String> scriptExecutionOrder, HashMap<String, String> scriptContentsByFilename) {
        // Add the most basic nashorn polyfill first
        scriptContentsByFilename.put("POLYFILL_BASICS", POLYFILL_BASICS);
        scriptExecutionOrder.add("POLYFILL_BASICS");
        scriptHasBeenLoadedByName.put("POLYFILL_BASICS", false);
        LOG.info("prepareNashornPolyfillScripts- scriptHasBeenLoadedByName: POLYFILL_BASICS -> false");

        // Next, try to add the default nashornPolyfills, pre-built from react4xp-runtime-nashornpolyfills:
        try {
            // ('build/resources/main' + defaultPolyfillFileName) must match (env.BUILD_R4X + env.NASHORNPOLYFILLS_FILENAME)
            // in the nashornPolyfills task in build.gradle!
            String defaultPolyfillFileName = "/lib/enonic/react4xp/default/nashornPolyfills.js";

            String content = ResourceHandler.readResource(defaultPolyfillFileName);
            scriptContentsByFilename.put(defaultPolyfillFileName, content);
            scriptExecutionOrder.add(defaultPolyfillFileName);
            scriptHasBeenLoadedByName.put(defaultPolyfillFileName, false);
            LOG.info("prepareNashornPolyfillScripts- scriptHasBeenLoadedByName: " + defaultPolyfillFileName + " -> false");

        } catch (Exception e) {
            LOG.error(e.getClass().getSimpleName() + " while fetching the pre-built default nashorn polyfill for React4xp (/lib/enonic/react4xp/default/nashornPolyfills.js): " + e.getMessage());
        }

        // Next, if the user has added any extra polyfills, the filename will be in NASHORNPOLYFILLS_FILENAME:
        if (NASHORNPOLYFILLS_FILENAME != null && !"".equals(NASHORNPOLYFILLS_FILENAME.trim())) {
            LOG.info("Adding additional nashorn polyfills for react4xp SSR: NASHORNPOLYFILLS_FILENAME = "+ NASHORNPOLYFILLS_FILENAME);
            try {
                String file = CHUNKFILES_HOME + NASHORNPOLYFILLS_FILENAME;
                String content = ResourceHandler.readResource(file);
                scriptContentsByFilename.put(file, content);
                scriptExecutionOrder.add(file);
                scriptHasBeenLoadedByName.put(file, false);
                LOG.info("prepareNashornPolyfillScripts - scriptHasBeenLoadedByName: " + file + " -> false");

            } catch (Exception e) {
                LOG.warn(e.getClass().getSimpleName() + " while trying to add custom nashorn polyfill for React4xp (NASHORNPOLYFILLS_FILENAME = " + NASHORNPOLYFILLS_FILENAME + "): " + e.getMessage());
            }
        }
    }


    private void addEntriesAndChunksScripts(String CHUNKFILES_HOME, String COMPONENT_STATS_FILENAME, ArrayList<String> CHUNK_SOURCEFILENAMES, String ENTRIES_SOURCEFILENAME, LinkedList<String> scriptExecutionOrder, HashMap<String, String> scriptContentsByFilename, boolean doLazyLoad) throws IOException {
        String ENTRIES_SOURCE = CHUNKFILES_HOME + ENTRIES_SOURCEFILENAME;
        ArrayList<String> CHUNKS_SOURCES = new ArrayList<>();
        for (String chunkFileName : CHUNK_SOURCEFILENAMES) {
            CHUNKS_SOURCES.add(CHUNKFILES_HOME + chunkFileName);
        }
        LOG.info("addEntriesAndChunksScripts - CHUNKS_SOURCES: " + CHUNKS_SOURCES);

        LinkedList<String> transpiledDependencies = new ChunkDependencyParser().getScriptDependencyNames(CHUNKFILES_HOME + COMPONENT_STATS_FILENAME, CHUNKS_SOURCES, ENTRIES_SOURCE, doLazyLoad);

        for (String scriptFile : transpiledDependencies) {
            LOG.info("addEntriesAndChunksScripts - dep: " + scriptFile);
            String file = CHUNKFILES_HOME + scriptFile;
            scriptContentsByFilename.put(file, ResourceHandler.readResource(file));
            scriptExecutionOrder.add(file);
            scriptHasBeenLoadedByName.put(file, false);
            LOG.info("addEntriesAndChunksScripts - scriptHasBeenLoadedByName: " + file + " -> false");
        }
    }


    private String mergeToRunnableScript(LinkedList<String> scriptExecutionOrder, HashMap<String, String> scriptContentsByFilename) {
        StringBuilder fullScript = new StringBuilder();
        for (String scriptName : scriptExecutionOrder) {

            LOG.info("mergeToRunnableScript - scriptHasBeenLoadedByName(" + scriptName + ") ? " + scriptHasBeenLoadedByName.get(scriptName));
            if (!scriptHasBeenLoadedByName.get(scriptName)) {
                LOG.info("Lazy-eval react4xp SSR asset: " + scriptName);
                String partialScript = scriptContentsByFilename.get(scriptName);
                fullScript.append(partialScript);
                scriptHasBeenLoadedByName.put(scriptName, true);
                LOG.info("mergeToRunnableScript - scriptHasBeenLoadedByName: " + scriptName + " -> true");
            }
        }
        return fullScript.toString();
    }


    // Multiple scripts were chained together, then evaluated, but one has failed.
    // The error is probably excessive and not very precise, since ALL the scripts were evaluated together the first time - hence "bloatedError".
    // Try to unravel which one(s) failed in order to give a clearer error message:
    private void handleScriptErrors(
            ScriptException bloatedError,
            LinkedList<String> scriptExecutionOrder,
            HashMap<String, String> scriptContentsByFilename,
            String fullScript) throws ScriptException
    {
        NashornScriptEngine tmpEngineInstance = (NashornScriptEngine)new ScriptEngineManager().getEngineByName("nashorn");
        int failureCount = 0;

        engineIsInitialized = false;

        ScriptException errorToThrow = null;

        for (String scriptName : scriptExecutionOrder) {
            String partialScript = null;
            try {
                partialScript = scriptContentsByFilename.get(scriptName);
                tmpEngineInstance.eval(partialScript);
            } catch (ScriptException specificError) {
                failureCount++;
                LOG.debug("");
                LOG.debug(scriptName + " script dump:");
                LOG.debug("---------------------------------\n\n");
                LOG.debug(partialScript+"\n\n");
                LOG.debug("---------------------------------------\n");
                LOG.error("INIT SCRIPT FAILURE #" + failureCount + " - " + specificError.getClass().getName() + ": " + specificError.getMessage() + " (" + scriptName + ":" + specificError.getLineNumber() + ". A full (compiled) script is dumped to the log at debug level)");
                if (errorToThrow == null) {
                    errorToThrow = specificError;
                }
                scriptHasBeenLoadedByName.put(scriptName, false);
                LOG.info("handleScriptErrors - scriptHasBeenLoadedByName: " + scriptName + " -> false");
            }
        }

        if (errorToThrow == null) {
            // Fallback if unravelling failed
            LOG.debug("");
            LOG.debug("CONCATENATED SCRIPTS - full dump:");
            LOG.debug("---------------------------------\n\n");
            LOG.debug(fullScript+"\n\n");
            LOG.debug("---------------------------------------\n");
            LOG.error("INIT SCRIPT FAILURE: script interaction? " + bloatedError.getClass().getName() + ": " + bloatedError.getMessage() + " (line " + bloatedError.getLineNumber() + ". A full (compiled) script is dumped to the log at debug level)");
            for (String scriptName : scriptExecutionOrder) {
                scriptHasBeenLoadedByName.put(scriptName, false);
                LOG.info("handleScriptErrors - scriptHasBeenLoadedByName: " + scriptName + " -> false");
            }
            throw bloatedError;

        } else {
            LOG.error(failureCount + " script error(s) were logged (see above). Details from #1:");
            throw errorToThrow;
        }
    }


    private void runScripts(LinkedList<String> scriptExecutionOrder, HashMap<String, String> scriptContentsByFilename) throws ScriptException {
        if (scriptExecutionOrder.size() > 0) {
            String fullScript = mergeToRunnableScript(scriptExecutionOrder, scriptContentsByFilename);

            LOG.info("!!!!!!!! runScripts - starting react4xp SSR evaluation...");
            try {
                ENGINE.eval(fullScript);

            } catch (ScriptException bloatedError) {
                handleScriptErrors(bloatedError, scriptExecutionOrder, scriptContentsByFilename, fullScript);
            }
            LOG.info("!!!!!!!! /runScripts - ...React4xp SSR evaluation is done.");
        }
    }



    private NashornScriptEngine buildEngine(String[] scriptEngineSettings) {
        if (
                scriptEngineSettings == null ||
                        scriptEngineSettings.length == 0 ||
                        (scriptEngineSettings.length == 1 && scriptEngineSettings[0] == null)
        ) {
            LOG.info("# Init SSR engine: uncached");
            return (NashornScriptEngine) new ScriptEngineManager().getEngineByName("nashorn");

        } else if (scriptEngineSettings.length == 1 && ("" + Integer.parseInt(scriptEngineSettings[0])).equals(scriptEngineSettings[0].trim())) {
            int cacheSize = Integer.parseInt(scriptEngineSettings[0]);
            if (cacheSize > 0) {
                LOG.info("# Init SSR engine: nashornCacheSize=" + cacheSize + "");
                return (NashornScriptEngine) new NashornScriptEngineFactory().getScriptEngine("--persistent-code-cache", "--class-cache-size=" + cacheSize);
            } else {
                LOG.info("# Init SSR engine: cache size is zero or less -> uncached");
                return (NashornScriptEngine) new ScriptEngineManager().getEngineByName("nashorn");
            }

        } else {
            LOG.info("# Init SSR engine: custom settings");
            return (NashornScriptEngine) new NashornScriptEngineFactory().getScriptEngine(scriptEngineSettings);
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
    public synchronized NashornScriptEngine initEngine(
            String CHUNKFILES_HOME,
            String NASHORNPOLYFILLS_FILENAME,
            String ENTRIES_SOURCEFILENAME,
            String COMPONENT_STATS_FILENAME,
            ArrayList<String> CHUNK_SOURCEFILENAMES,
            boolean SSR_LAZYLOAD,
            String[] scriptEngineSettings
    ) throws IOException, ScriptException {
        if (!engineIsInitialized) {
            LOG.info("######################### EngineFactory " + this.hashCode() + " initializing new SSR engine with these scriptEngineSettings: " + scriptEngineSettings.toString());
            LOG.info("doLazyLoad: " + SSR_LAZYLOAD);

            engineIsInitialized = true;
            ENGINE = buildEngine(scriptEngineSettings);

            scriptHasBeenLoadedByName = new HashMap<>();
            LOG.info("initBasicSettings - scriptHasBeenLoadedByName initialized.");

            try {
                LOG.info("Going to sleep: " + this.hashCode());
                Thread.sleep(5000);
                LOG.info("Waking up:      " + this.hashCode());
            } catch (InterruptedException e) {
                e.printStackTrace();
            }

            HashMap<String, String> scriptContentsByFilename = new HashMap<>();
            // Sequence matters, but hashmaps are not ordered! Use ordered scriptList collection 'scriptExecutionOrder' for iteration!
            LinkedList<String> scriptExecutionOrder = new LinkedList<>();

            prepareNashornPolyfillScripts(CHUNKFILES_HOME, NASHORNPOLYFILLS_FILENAME, scriptExecutionOrder, scriptContentsByFilename);
            LOG.info("post-prepareNashornPolyfillScripts - scriptContentsByFilename: " + scriptContentsByFilename);
            LOG.info("post-prepareNashornPolyfillScripts - scriptExecutionOrder: " + scriptExecutionOrder);
            LOG.info("post-prepareNashornPolyfillScripts - scriptHasBeenLoadedByName: " + scriptHasBeenLoadedByName.toString());

            //addEntriesAndChunksScripts(CHUNKFILES_HOME, COMPONENT_STATS_FILENAME, CHUNK_SOURCEFILENAMES, ENTRIES_SOURCEFILENAME, scriptExecutionOrder, scriptContentsByFilename, SSR_LAZYLOAD);

            runScripts(scriptExecutionOrder, scriptContentsByFilename);
            LOG.info("######################### /EngineFactory " + this.hashCode() + " initialized SSR Engine: " + ENGINE.hashCode());
        }

        LOG.info("Returning SSR Engine " + ENGINE.hashCode());
        return ENGINE;
    }
}
