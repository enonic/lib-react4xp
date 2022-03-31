package com.enonic.lib.react4xp.ssr.engineFactory;

import jdk.nashorn.api.scripting.NashornScriptEngine;
import jdk.nashorn.api.scripting.NashornScriptEngineFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Created on 10/05/2021 as part of
 */
public class EngineBuilderCached implements EngineBuilder {
    private final static Logger LOG = LoggerFactory.getLogger( EngineBuilderCached.class );
    private final int cacheSize;

    public EngineBuilderCached(int cacheSize) {
        this.cacheSize = cacheSize;
    }

	@SuppressWarnings("removal")
    public NashornScriptEngine buildEngine() {
        LOG.info("Init SSR engine (cacheSize=" + cacheSize + "): `--persistent-code-cache`, `--class-cache-size=" + cacheSize + "`");
        return (NashornScriptEngine) new NashornScriptEngineFactory().getScriptEngine("--persistent-code-cache", "--class-cache-size=" + cacheSize);
    }
}
