package com.enonic.lib.react4xp.ssr;

import jdk.nashorn.api.scripting.NashornScriptEngine;
import jdk.nashorn.api.scripting.NashornScriptEngineFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.script.ScriptEngineManager;
import javax.script.ScriptException;
import java.io.IOException;

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

    // ['build/resources/main' + defaultPolyfillFileName] MUST match [env.BUILD_R4X + env.NASHORNPOLYFILLS_FILENAME]
    // in the nashornPolyfills task in build.gradle!
    String POLYFILL_REACT4XP_DEFAULT_FILE = "/lib/enonic/react4xp/default/nashornPolyfills.js";

    private boolean engineIsInitialized = false;







    private NashornScriptEngine buildEngine(String[] scriptEngineSettings) {
        if (
                scriptEngineSettings == null ||
                        scriptEngineSettings.length == 0 ||
                        (scriptEngineSettings.length == 1 && scriptEngineSettings[0] == null)
        ) {
            LOG.info("# Init SSR engine: no settings (uncached)");
            return (NashornScriptEngine) new ScriptEngineManager().getEngineByName("nashorn");

        } else if (scriptEngineSettings.length == 1 && ("" + Integer.parseInt(scriptEngineSettings[0])).equals(scriptEngineSettings[0].trim())) {
            int cacheSize = Integer.parseInt(scriptEngineSettings[0]);
            if (cacheSize > 0) {
                LOG.info("# Init SSR engine: `--persistent-code-cache`, `--class-cache-size=" + cacheSize + "`");
                return (NashornScriptEngine) new NashornScriptEngineFactory().getScriptEngine("--persistent-code-cache", "--class-cache-size=" + cacheSize);
            } else {
                LOG.info("# Init SSR engine: cacheSize<1 --> no settings (uncached)");
                return (NashornScriptEngine) new ScriptEngineManager().getEngineByName("nashorn");
            }

        } else {
            LOG.info("# Init SSR engine with custom settings: `" + String.join("`, ", scriptEngineSettings) + "`");
            return (NashornScriptEngine) new NashornScriptEngineFactory().getScriptEngine(scriptEngineSettings);
        }
    }


    private void reportAndRethrow(ScriptException e, String code, String filename) throws ScriptException {
        String label = (filename != null)
                ? " '" + filename + "'"
                : "";

        LOG.info("");
        LOG.error(e.getClass().getSimpleName() + " in " + EngineFactory.class.getName() + ".initEngine:");
        LOG.error(e.getMessage());
        LOG.info("");
        LOG.info("Code dump:" + label);
        LOG.info("---------------------------------\n\n");
        LOG.info(code + "\n\n");
        LOG.info("---------------------------------------\n");
        LOG.info("...end of" + label + " code dump.");
        throw e;
    }


    /** MAIN ENTRY.
     * CHUNK_SOURCEFILES is a list of files (filename only, expected to be found in CHUNKFILES_HOME alongside the entries file)
     * that each describe one or several bundle/chunk asset file names, used to generate
     * a full list of dependency files, since the file names are hashed by webpack.
     * Sequence matters! These engine initialization scripts are run in this order.
     * Scripts found in chunks.json depend on the previous and must be the last!
     * nashornPolyfills.js script is the basic dependency, and will be added at the very beginning
     * outside of this list. */
    public synchronized EngineContainer initEngine(String[] scriptEngineSettings) throws IOException, ScriptException {
        if (!engineIsInitialized) {
                                                                                                                        LOG.info("React4xp SSR EngineFactory init - scriptEngineSettings: " + scriptEngineSettings.toString());

            engineIsInitialized = true;
            ENGINE = buildEngine(scriptEngineSettings);

                                                                                                                        LOG.info("React4xp SSR EngineFactory init - default nashorn polyfills");
            try {
                ENGINE.eval(POLYFILL_BASICS);

            } catch (ScriptException e) {
                reportAndRethrow(e, POLYFILL_BASICS, null);
            }

            String content = null;
            try {
                content = ResourceHandler.readResource(POLYFILL_REACT4XP_DEFAULT_FILE);
                ENGINE.eval(content);

            } catch (ScriptException e) {
                reportAndRethrow(e, content, POLYFILL_REACT4XP_DEFAULT_FILE);
            }

                                                                                                                        /*
                                                                                                                        Good for testing: https://github.com/enonic/lib-react4xp/issues/191
                                                                                                                        try {
                                                                                                                            LOG.info("Going to sleep: " + this.hashCode());
                                                                                                                            Thread.sleep(5000);
                                                                                                                            LOG.info("Waking up:      " + this.hashCode());
                                                                                                                        } catch (InterruptedException e) {
                                                                                                                            e.printStackTrace();
                                                                                                                        }*/

                                                                                                                        LOG.info("React4xp SSR EngineFactory init - done.");
            return new EngineContainer(ENGINE, true);
        } else {
                                                                                                                        LOG.info("React4xp SSR EngineFactory - got existing engine.");
            return new EngineContainer(ENGINE, false);
        }
    }
}
