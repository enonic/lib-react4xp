package com.enonic.lib.react4xp.ssr.engine;

import org.graalvm.polyglot.Context;
import org.graalvm.polyglot.Engine;
import org.graalvm.polyglot.HostAccess;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class EngineFactory
{
    private final static Logger LOG = LoggerFactory.getLogger( EngineFactory.class );

    public static Engine buildSharedEngine()
    {
        LOG.debug( "Init shared script engine" );
        final ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
        Thread.currentThread().setContextClassLoader( ClassLoader.getSystemClassLoader() );
        try
        {
            final Engine engine = Engine.newBuilder( "js" )
                .allowExperimentalOptions( true )
                .build();
            LOG.debug( "Got shared engine {}", engine.getImplementationName() );
            return engine;
        }
        finally
        {
            Thread.currentThread().setContextClassLoader( classLoader );
        }
    }

    public static Context buildContext( final Engine engine )
    {
        LOG.debug( "Init script context" );
        final ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
        Thread.currentThread().setContextClassLoader( ClassLoader.getSystemClassLoader() );
        try
        {
            return Context.newBuilder( "js" )
                .engine( engine )
                .allowExperimentalOptions( true )
                .allowHostAccess( HostAccess.NONE )
                .build();
        }
        finally
        {
            Thread.currentThread().setContextClassLoader( classLoader );
        }
    }
}
