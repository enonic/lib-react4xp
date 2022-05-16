package com.enonic.lib.react4xp.ssr.engineFactory;

import java.util.List;
import java.util.stream.Collectors;

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

    public EngineBuilderPlatform( final String engineName )
    {
        this.engineName = engineName;
    }

    public ScriptEngine buildEngine()
    {

        final ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
        Thread.currentThread().setContextClassLoader( ClassLoader.getSystemClassLoader() );
        try
        {
            final ScriptEngineManager scriptEngineManager = new ScriptEngineManager();
            final String resolvedEngineName;
            if ( engineName == null )
            {
                final List<String> engineNames = scriptEngineManager.getEngineFactories()
                    .stream()
                    .map( ScriptEngineFactory::getEngineName )
                    .collect( Collectors.toList() );
                LOG.debug( "Available engines {}", engineNames );
                if ( engineNames.contains( "Graal.js" ) )
                {
                    resolvedEngineName = "Graal.js";
                }
                else
                {
                    resolvedEngineName = "JavaScript";
                }
            }
            else
            {
                resolvedEngineName = engineName;
            }
            LOG.debug( "Init SSR engine: platform {}", resolvedEngineName );
            final ScriptEngine engineByName = scriptEngineManager.getEngineByName( resolvedEngineName );
            LOG.debug( "Got platform engine {}", engineByName.getFactory().getEngineName() );
            return engineByName;
        }
        finally
        {
            Thread.currentThread().setContextClassLoader( classLoader );
        }
    }
}
