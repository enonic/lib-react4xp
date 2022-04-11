package com.enonic.lib.react4xp.ssr.engineFactory;

import jdk.nashorn.api.scripting.NashornScriptEngine;
import jdk.nashorn.api.scripting.NashornScriptEngineFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Created on 10/05/2021 as part of
 */
public class EngineBuilderUncached implements EngineBuilder {
    private final static Logger LOG = LoggerFactory.getLogger( EngineBuilderUncached.class );

	@SuppressWarnings("removal")
    public NashornScriptEngine buildEngine() {
        LOG.debug("Init SSR engine: no settings, uncached");
        return (NashornScriptEngine) new NashornScriptEngineFactory().getScriptEngine();
    }
}
