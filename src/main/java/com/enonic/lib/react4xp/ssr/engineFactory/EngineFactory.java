package com.enonic.lib.react4xp.ssr.engineFactory;

import com.enonic.lib.react4xp.ssr.errors.ErrorHandler;
import com.enonic.lib.react4xp.ssr.resources.ResourceHandler;
import jdk.nashorn.api.scripting.NashornScriptEngine;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.script.ScriptException;
import java.io.IOException;

public class EngineFactory {
    private final static Logger LOG = LoggerFactory.getLogger( EngineFactory.class );

    private final EngineBuilder engineBuilder;


    public EngineFactory(String[] scriptEngineSettings) {
        engineBuilder = getEngineBuilder(scriptEngineSettings);
    }


    private EngineBuilder getEngineBuilder(String[] scriptEngineSettings) {
        if (
                scriptEngineSettings == null ||
                        scriptEngineSettings.length == 0 ||
                        (scriptEngineSettings.length == 1 && scriptEngineSettings[0] == null)
        ) {
            return new EngineBuilderUncached();

        } else if (scriptEngineSettings.length == 1 && ("" + Integer.parseInt(scriptEngineSettings[0])).equals(scriptEngineSettings[0].trim())) {
            int cacheSize = Integer.parseInt(scriptEngineSettings[0]);
            if (cacheSize > 0) {
                return new EngineBuilderCached(cacheSize);
            } else {
                return new EngineBuilderUncached();
            }

        } else {
            return new EngineBuilderCustom(scriptEngineSettings);
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
    public synchronized NashornScriptEngine buildEngine() throws IOException, ScriptException {

        // Basic-level polyfills. For some reason, this must be run from here, not from nashornPolyfills.js.
        // TODO: shouldn't be a string here, but read from a JS file, preferrably in the react4xp-runtime-nashornpolyfills package.
        String POLYFILL_BASICS = "" +
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

        NashornScriptEngine engine = engineBuilder.buildEngine();

        try {
            engine.eval(POLYFILL_BASICS);

        } catch (ScriptException e) {
            ErrorHandler errorHandler = new ErrorHandler();
            // LOG.error(errorHandler.getLoggableStackTrace(e, e.getClass().getSimpleName() + " in " + EngineFactory.class.getName() + ".initEngine"));
            LOG.info(errorHandler.getCodeDump(e, POLYFILL_BASICS, null));
            throw e;
        }

        // ['build/resources/main' + defaultPolyfillFileName] MUST match [env.BUILD_R4X + env.NASHORNPOLYFILLS_FILENAME]
        // in the nashornPolyfills task in build.gradle!
        String POLYFILL_REACT4XP_DEFAULT_FILE = "/lib/enonic/react4xp/default/nashornPolyfills.js";

        String content = null;
        try {
            content = ResourceHandler.readResource(POLYFILL_REACT4XP_DEFAULT_FILE);
            engine.eval(content);

        } catch (ScriptException e) {
            ErrorHandler errorHandler = new ErrorHandler();
            // LOG.error(errorHandler.getLoggableStackTrace(e, e.getClass().getSimpleName() + " in " + EngineFactory.class.getName() + ".initEngine"));
            LOG.info(errorHandler.getCodeDump(e, content, POLYFILL_REACT4XP_DEFAULT_FILE));
            throw e;
        }


        return engine;
    }
}
