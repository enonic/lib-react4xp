package com.enonic.lib.react4xp.ssr.resources;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.graalvm.polyglot.Context;
import org.graalvm.polyglot.PolyglotException;
import org.graalvm.polyglot.Source;
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

    private final Context context;

    private final SourceProvider sourceProvider;

    private final Set<String> assetLoadedMarkers = new HashSet<>();

    public AssetLoader( ResourceReader resourceReader, String scriptsHome, long id, Context context, SourceProvider sourceProvider )
    {
        this.id = id;
        this.resourceReader = resourceReader;
        this.scriptsHome = scriptsHome;
        this.context = context;
        this.sourceProvider = sourceProvider;
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
            eval( context, sourceProvider.get( asset, assetContent ) );
        }
        catch ( RenderException e )
        {
            ErrorHandler errorHandler = new ErrorHandler();
            LOG.error( "{}{}\n\n{}: {}\nEngine #{}\nassetName = '{}'\n{}",
                       e.getStacktraceString() == null ? "" : e.getStacktraceString() + "\n", errorHandler.getLoggableStackTrace( e, null ),
                       e.getClass().getSimpleName(), e.getMessage(), id, asset, errorHandler.getSolutionTips() );

            throw e;
        }
        if ( RunMode.get() == RunMode.PROD )
        {
            assetLoadedMarkers.add( asset );
        }
        LOG.debug( "#{}: ...'{}' loaded", id, asset );
    }

    private static void eval( final Context context, final Source source )
        throws RenderException
    {
        final ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
        Thread.currentThread().setContextClassLoader( context.getClass().getClassLoader() );
        try
        {
            context.eval( source );
        }
        catch ( PolyglotException e )
        {
            throw new RenderException( e );
        }
        finally
        {
            Thread.currentThread().setContextClassLoader( classLoader );
        }
    }
}
