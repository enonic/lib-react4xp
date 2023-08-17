package com.enonic.lib.react4xp.ssr.resources;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import javax.script.ScriptEngine;
import javax.script.ScriptException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.enonic.lib.react4xp.ssr.errors.ErrorHandler;
import com.enonic.lib.react4xp.ssr.errors.RenderException;
import com.enonic.xp.resource.ResourceNotFoundException;
import com.enonic.xp.server.RunMode;

public class AssetLoader
{
    private static final Logger LOG = LoggerFactory.getLogger( AssetLoader.class );

    private final long id;

    private final ResourceReader resourceReader;

    private final String scriptsHome;

    private final ScriptEngine engine;

    private final Set<String> assetLoadedMarkers = new HashSet<>();

    public AssetLoader( ResourceReader resourceReader, String scriptsHome, long id, ScriptEngine engine )
    {
        this.id = id;
        this.resourceReader = resourceReader;
        this.scriptsHome = scriptsHome;
        this.engine = engine;
    }

    public void loadAssetsIntoEngine( List<String> assets )
    {
        for ( String assetName : assets )
        {
            final String asset = assetName.startsWith( "/" ) ? assetName : scriptsHome + "/" + assetName;
            loadAssetIntoEngine( asset, true );
        }
    }

    public void loadAssetIntoEngine( final String asset, final boolean failOnNotFound )
    {
        if (assetLoadedMarkers.contains( asset )) {
            LOG.debug( "#{}: asset '{}' already loaded, skipping", id, asset );
            return;
        }

        LOG.debug( "#{}: loading resource '{}'", id, asset );
        final String assetContent;
        try
        {
            assetContent = resourceReader.readResource( asset );
        }
        catch ( ResourceNotFoundException r )
        {
            if ( failOnNotFound )
            {
                throw r;
            }
            else
            {
                LOG.debug( "Resource {} not found, but that's probably ok :)", asset );
                return;
            }
        }

        LOG.debug( "#{}: eval resource '{}'", id, asset );
        try
        {
            eval( engine, assetContent );
        }
        catch ( RenderException e )
        {
            ErrorHandler errorHandler = new ErrorHandler();
            LOG.error(
                ( e.getStacktraceString() == null ? "" : e.getStacktraceString() + "\n" ) + errorHandler.getLoggableStackTrace( e, null ) +
                    "\n\n" + e.getClass().getSimpleName() + ": " + e.getMessage() + "\n" +
                    "Engine #" + id + "\n" +
                    "assetName = '" + asset + "'\n" + errorHandler.getSolutionTips() );

            throw e;
        }
        if ( RunMode.get() == RunMode.PROD )
        {
            assetLoadedMarkers.add( asset );
        }
        LOG.debug( "#{}: ...'{}' loaded", id, asset );
    }

    private static void eval( final ScriptEngine engine, final String callScript )
        throws RenderException
    {
        final ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
        Thread.currentThread().setContextClassLoader( engine.getClass().getClassLoader() );
        try
        {
            engine.eval( callScript );
        }
        catch ( ScriptException e )
        {
            throw new RenderException( e );
        }
        finally
        {
            Thread.currentThread().setContextClassLoader( classLoader );
        }
    }

}
