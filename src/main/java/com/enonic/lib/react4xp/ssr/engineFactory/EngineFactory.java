package com.enonic.lib.react4xp.ssr.engineFactory;

import com.enonic.lib.react4xp.ssr.errors.ErrorHandler;
import com.enonic.lib.react4xp.ssr.resources.ResourceReader;
import jdk.nashorn.api.scripting.NashornScriptEngine;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.script.ScriptException;
import java.io.IOException;

public class EngineFactory {
    private final static Logger LOG = LoggerFactory.getLogger( EngineFactory.class );

    private final EngineBuilder engineBuilder;
    private final ResourceReader resourceReader;

    // ['build/resources/main' + defaultPolyfillFileName] MUST match [env.BUILD_R4X + env.NASHORNPOLYFILLS_FILENAME]
    // in the nashornPolyfills task in build.gradle!
    private final static String POLYFILL_REACT4XP_DEFAULT_FILE = "/lib/enonic/react4xp/default/nashornPolyfills.js";

    // Basic-level polyfills. For some reason, these must be run hardcoded from here, not from nashornPolyfills.js.
    // TODO: shouldn't be a string here, but read from a JS file. From react4xp-runtime-nashornpolyfills package? Or make it available in the jar (/lib)?
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













    /////////////////////////////////////////////////////////// INIT

    public EngineFactory(String[] scriptEngineSettings, ResourceReader resourceReader) {
        engineBuilder = getEngineBuilder(scriptEngineSettings);
        this.resourceReader = resourceReader;
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






    ////////////////////////////////////////////////////////////////////////////////////// ENTRY

    /** MAIN ENTRY.
     * CHUNK_SOURCEFILES is a list of files (filename only, expected to be found in CHUNKFILES_HOME alongside the entries file)
     * that each describe one or several bundle/chunk asset file names, used to generate
     * a full list of dependency files, since the file names are hashed by webpack.
     * Sequence matters! These engine initialization scripts are run in this order.
     * Scripts found in chunks.json depend on the previous and must be the last!
     * nashornPolyfills.js script is the basic dependency, and will be added at the very beginning
     * outside of this list. */
    public NashornScriptEngine buildEngine(long id) throws IOException, ScriptException {
        NashornScriptEngine engine = engineBuilder.buildEngine();

        // if (!IS_PRODMODE) {
        LOG.info("#" + id + ": loading polyfill basics");
        // }

        try {

            engine.eval(POLYFILL_BASICS);

            // if (!IS_PRODMODE) {
            LOG.info("#" + id + ": successfully loaded polyfill basics");
            // }

        } catch (ScriptException e) {
            ErrorHandler errorHandler = new ErrorHandler();
            // LOG.error(errorHandler.getLoggableStackTrace(e, e.getClass().getSimpleName() + " in " + EngineFactory.class.getName() + ".initEngine"));
            LOG.error(EngineFactory.class.getName() + "#" + id + ".buildEngine:");
            LOG.info(errorHandler.getCodeDump(e, POLYFILL_BASICS, null));
            throw e;
        }

        String assetContent = null;
        try {
            // if (!IS_PRODMODE) {
            LOG.info("#" + id + ": loading asset '" + POLYFILL_REACT4XP_DEFAULT_FILE + "'");
            // }

            assetContent =  resourceReader.readResource(POLYFILL_REACT4XP_DEFAULT_FILE);
            engine.eval(assetContent);

            // if (!IS_PRODMODE) {
            LOG.info("#" + id + ": successfully loaded '" + POLYFILL_REACT4XP_DEFAULT_FILE + "'");
            // }

        } catch (ScriptException e1) {
            ErrorHandler errorHandler = new ErrorHandler();
            LOG.error(
                    errorHandler.getLoggableStackTrace(e1, null) + "\n\n" +
                            e1.getClass().getSimpleName()  + ": " + e1.getMessage() + "\n" +
                            "in " + EngineFactory.class.getName() + "#" + id + ".buildEngine\n" +
                            "assetName = '" + POLYFILL_REACT4XP_DEFAULT_FILE + "'\n" +
                            errorHandler.getSolutionTips());
            LOG.info(errorHandler.getCodeDump(e1, assetContent, POLYFILL_REACT4XP_DEFAULT_FILE));

            throw e1;
        }

        return engine;
    }
}
