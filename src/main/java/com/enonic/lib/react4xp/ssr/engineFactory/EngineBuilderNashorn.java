package com.enonic.lib.react4xp.ssr.engineFactory;

import javax.script.ScriptEngine;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jdk.nashorn.api.scripting.NashornScriptEngineFactory;

/**
 * Created on 10/05/2021 as part of
 */
public class EngineBuilderNashorn
    implements EngineBuilder {

    private static final Logger LOG = LoggerFactory.getLogger( EngineBuilderNashorn.class );

    private final String[] scriptEngineSettings;

    public EngineBuilderNashorn( String[] scriptEngineSettings )
    {
        this.scriptEngineSettings = ( scriptEngineSettings == null || scriptEngineSettings.length == 0 )
            ? new String[]{"--optimistic-types=false"}
            : scriptEngineSettings;
    }

    @SuppressWarnings("removal")
    public ScriptEngine buildEngine()
    {
        LOG.debug( "Init SSR engine with custom settings: `{}`", String.join( "`, ", scriptEngineSettings ) );
        return new NashornScriptEngineFactory().getScriptEngine( scriptEngineSettings );
    }
}
