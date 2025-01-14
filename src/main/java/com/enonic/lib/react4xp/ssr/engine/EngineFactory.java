package com.enonic.lib.react4xp.ssr.engine;

import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class EngineFactory
{
    private final static Logger LOG = LoggerFactory.getLogger( EngineFactory.class );

    private static final ScriptEngineManager SCRIPT_ENGINE_MANAGER;

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
    }

    public static ScriptEngine buildEngine()
    {
        LOG.debug( "Init script engine");
        final ScriptEngine engineByName;

        final ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
        Thread.currentThread().setContextClassLoader( ClassLoader.getSystemClassLoader() );
        try
        {
            engineByName = SCRIPT_ENGINE_MANAGER.getEngineByName( "Graal.js" );
        }
        finally
        {
            Thread.currentThread().setContextClassLoader( classLoader );
        }
        LOG.debug( "Got engine {}", engineByName.getFactory().getEngineName() );
        return engineByName;
    }
}
