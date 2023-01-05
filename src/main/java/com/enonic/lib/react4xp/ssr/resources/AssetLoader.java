package com.enonic.lib.react4xp.ssr.resources;

import java.io.IOException;
import java.util.HashSet;
import java.util.List;
import java.util.Map;

import javax.script.ScriptEngine;
import javax.script.ScriptException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.enonic.lib.react4xp.ssr.ServerSideRenderer;
import com.enonic.lib.react4xp.ssr.errors.ErrorHandler;
import com.enonic.lib.react4xp.ssr.errors.RenderException;
import com.enonic.xp.resource.ResourceNotFoundException;
import com.enonic.xp.server.RunMode;

import static com.enonic.lib.react4xp.ssr.errors.ErrorHandler.KEY_ERROR;
import static com.enonic.lib.react4xp.ssr.errors.ErrorHandler.KEY_STACKTRACE;


public class AssetLoader
{
    private static final Logger LOG = LoggerFactory.getLogger( AssetLoader.class );

    public static final boolean IS_PRODMODE = RunMode.get() == RunMode.PROD;

    private final HashSet<String> assetLoadedMarkers = new HashSet<>();

    private final long id;

    private final ResourceReader resourceReader;

    private final String scriptsHome;

    private final ScriptEngine engine;

    public AssetLoader( ResourceReader resourceReader, String scriptsHome, long id, ScriptEngine engine )
    {
        this.id = id;
        this.resourceReader = resourceReader;
        this.scriptsHome = scriptsHome;
        this.engine = engine;
    }

    public void loadAssetsIntoEngine( List<String> runnableAssets )
    {
        for ( String assetName : runnableAssets )
        {
            if ( shouldLoadAsset( assetName ) )
            {
                final String asset = assetName.startsWith( "/" ) ? assetName : scriptsHome + "/" + assetName;
                loadAssetIntoEngine( asset, true );
                markAssetLoaded( assetName );
            }
        }
    }

    private boolean shouldLoadAsset( String assetName )
    {
        return ( !IS_PRODMODE || ! assetLoadedMarkers.contains( assetName ) );
    }

    private void markAssetLoaded( String assetName )
    {
        if ( IS_PRODMODE )
        {
            assetLoadedMarkers.add( assetName );
        }
    }


    public void loadAssetIntoEngine( final String asset, final boolean failOnNotFound )
    {
        String assetContent = null;
        try
        {
            LOG.debug( "#{}: loading resource '{}'", id, asset );

            assetContent = resourceReader.readResource( asset );
            eval( engine, assetContent );

            LOG.debug( "#{}: ...'{}' ok.", id, asset );
        } catch ( IOException e) {
            throw new RenderException( e );
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
            }
        }
        catch ( RenderException e )
        {
            ErrorHandler errorHandler = new ErrorHandler();
            LOG.error(
                ( e.getStacktraceString() == null ? "" : e.getStacktraceString() + "\n" ) + errorHandler.getLoggableStackTrace( e, null ) +
                    "\n\n" + e.getClass().getSimpleName() + ": " + e.getMessage() + "\n" +
                    "Engine #" + id + "\n" +
                    "in " + ServerSideRenderer.class.getName() + ".loadAsset\n" +
                    "assetName = '" + asset + "'\n" + errorHandler.getSolutionTips() );
            LOG.debug( errorHandler.getCodeDump( assetContent, asset ) );

            throw e;
        }
    }

    private static void eval( final ScriptEngine engine, final String runnableCode )
        throws RenderException
    {
        String callScript = "var __react4xp__internal__obj__ = {};" + "try {\n " + runnableCode + "\n}" +
            "catch (error) { __react4xp__internal__obj__ = { stack: ''+error.stack, error: error.message }; }; " +
            "__react4xp__internal__obj__;";
        try
        {
            Map result;
            final ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
            Thread.currentThread().setContextClassLoader( engine.getClass().getClassLoader() );
            try
            {
                result = (Map) engine.eval( callScript );
            }
            finally
            {
                Thread.currentThread().setContextClassLoader( classLoader );
            }

            String errorMessage = (String) result.get( KEY_ERROR );

            if ( errorMessage != null && !errorMessage.isBlank() )
            {
                String errorStack = (String) result.get( KEY_STACKTRACE );
                throw new RenderException( errorMessage, errorStack );
            }

        }
        catch ( ScriptException s )
        {
            throw new RenderException( s );
        }
    }

    public String toString()
    {
        return AssetLoader.class.getSimpleName() + "#" + id;
    }
}
