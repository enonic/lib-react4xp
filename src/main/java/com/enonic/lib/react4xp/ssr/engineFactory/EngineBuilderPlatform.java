package com.enonic.lib.react4xp.ssr.engineFactory;

import java.util.Objects;

import javax.script.ScriptEngine;
import javax.script.ScriptEngineFactory;
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

    private static final ScriptEngineManager SCRIPT_ENGINE_MANAGER;

    private static final String PREFERRED_ENGINE;

    public EngineBuilderPlatform( final String engineName )
    {
        this.engineName = engineName;
    }

    static
    {
        final ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
        Thread.currentThread().setContextClassLoader( ClassLoader.getSystemClassLoader() );
        try
        {
            SCRIPT_ENGINE_MANAGER = new ScriptEngineManager();
        }
        finally
        {
            Thread.currentThread().setContextClassLoader( classLoader );
        }

        boolean hasGraalJs = SCRIPT_ENGINE_MANAGER.getEngineFactories()
            .stream()
            .map( ScriptEngineFactory::getEngineName )
            .anyMatch( name -> name.contains( "Graal.js" ) );

        boolean hasNashorn = SCRIPT_ENGINE_MANAGER.getEngineFactories()
            .stream()
            .map( ScriptEngineFactory::getEngineName )
            .anyMatch( name -> name.contains( "Nashorn" ) );
        PREFERRED_ENGINE = hasGraalJs ? "Graal.js" : hasNashorn ? "Nashorn" : "JavaScript";
    }

    public static String preferredEngineName()
    {
        return PREFERRED_ENGINE;
    }

    public ScriptEngine buildEngine()
    {
        final String resolvedEngineName = Objects.requireNonNullElse( engineName, PREFERRED_ENGINE );

        LOG.debug( "Init SSR engine: platform {}", resolvedEngineName );
        final ScriptEngine engineByName;

        final ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
        Thread.currentThread().setContextClassLoader( ClassLoader.getSystemClassLoader() );
        try
        {
            engineByName = SCRIPT_ENGINE_MANAGER.getEngineByName( resolvedEngineName );
        }
        finally
        {
            Thread.currentThread().setContextClassLoader( classLoader );
        }
        LOG.debug( "Got platform engine {}", engineByName.getFactory().getEngineName() );
        return engineByName;
    }
}
