package com.enonic.lib.react4xp.ssr.engineFactory;

import jdk.nashorn.api.scripting.NashornScriptEngine;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.script.ScriptEngineManager;

/**
 * Created on 10/05/2021 as part of
 */
public class EngineBuilderUncached implements EngineBuilder {
    private final static Logger LOG = LoggerFactory.getLogger( EngineBuilderUncached.class );
    public NashornScriptEngine buildEngine() {
        LOG.info("Init SSR engine: no settings, uncached");
        return (NashornScriptEngine) new ScriptEngineManager().getEngineByName("nashorn");
    }
}
