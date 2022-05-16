package com.enonic.lib.react4xp.ssr.engineFactory;

import java.util.Objects;

import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Created on 10/05/2021 as part of
 */
public class EngineBuilderPlatform
    implements EngineBuilder
{
    private final static Logger LOG = LoggerFactory.getLogger( EngineBuilderPlatform.class );

    private final String engineName;

    public EngineBuilderPlatform( final String engineName )
    {
        this.engineName = engineName;
    }

    public ScriptEngine buildEngine()
    {
        final String resolvedEngineName = Objects.requireNonNullElse( engineName, "JavaScript" );
        LOG.debug( "Init SSR engine: platform {}", resolvedEngineName );
        final ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
        Thread.currentThread().setContextClassLoader( ClassLoader.getSystemClassLoader() );
        try {
            final ScriptEngine engineByName = new ScriptEngineManager().getEngineByName( resolvedEngineName );
            LOG.debug( "Got platform engine {}", engineByName.getFactory().getEngineName() );
            return engineByName;
        } finally
        {
            Thread.currentThread().setContextClassLoader( classLoader );
        }
    }
}
