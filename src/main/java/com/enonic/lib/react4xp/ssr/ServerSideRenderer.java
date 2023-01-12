package com.enonic.lib.react4xp.ssr;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.function.Supplier;

import org.apache.commons.pool2.impl.GenericObjectPool;
import org.apache.commons.pool2.impl.GenericObjectPoolConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.enonic.lib.react4xp.ssr.engineFactory.EngineFactory;
import com.enonic.lib.react4xp.ssr.errors.ErrorHandler;
import com.enonic.lib.react4xp.ssr.pool.Renderer;
import com.enonic.lib.react4xp.ssr.pool.RendererFactory;
import com.enonic.lib.react4xp.ssr.resources.ResourceReader;
import com.enonic.lib.react4xp.ssr.resources.ResourceReaderImpl;
import com.enonic.xp.resource.ResourceService;
import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;


public class ServerSideRenderer
    implements ScriptBean
{
    private static final Logger LOG = LoggerFactory.getLogger( ServerSideRenderer.class );

    private final AtomicBoolean isInitialized = new AtomicBoolean();

    private final CountDownLatch latch = new CountDownLatch( 1 );

    private volatile GenericObjectPool<Renderer> rendererPool;

    private Supplier<ResourceService> resourceServiceSupplier;

    @Override
    public void initialize( BeanContext context )
    {
        this.resourceServiceSupplier = context.getService( ResourceService.class );
    }

    public void setup( String appName, String scriptsHome, String libraryName, String chunkfilesHome, String entriesJsonFilename,
                       String chunksExternalsJsonFilename, String statsComponentsFilename, boolean lazyload, Integer ssrMaxThreads,
                       String engineName, String[] scriptEngineSettings )
    {
        synchronized ( isInitialized )
        {
            if ( !isInitialized.get() )
            {
                int poolSize = ( ssrMaxThreads == null || ssrMaxThreads < 1 ) ? Runtime.getRuntime().availableProcessors() : ssrMaxThreads;

                LOG.debug( "Setting up{} SSR with {} engine{}...", lazyload ? " lazy-loading " : "", poolSize,
                           ( poolSize == 1 ? "" : "s" ) );

                final Config config =
                    new Config( appName, scriptsHome, libraryName, chunkfilesHome, entriesJsonFilename, chunksExternalsJsonFilename,
                                statsComponentsFilename, lazyload );

                final ResourceReader resourceReader = new ResourceReaderImpl( resourceServiceSupplier, config );
                final EngineFactory engineFactory = new EngineFactory( engineName, scriptEngineSettings, resourceReader );
                final RendererFactory rendererFactory = new RendererFactory( engineFactory, resourceReader, config );

                rendererPool = new GenericObjectPool<>( rendererFactory, createPoolConfig( poolSize ) );

                if ( !lazyload )
                {
                    asyncInitRenderers();
                }
                else
                {
                    latch.countDown();
                }

                isInitialized.set( true );
            }
        }
    }

    private static <T> GenericObjectPoolConfig<T> createPoolConfig( int poolSize )
    {
        final GenericObjectPoolConfig<T> poolConfig = new GenericObjectPoolConfig<>();
        poolConfig.setMaxWait( Duration.ofMillis( 200000 ) );
        poolConfig.setMaxIdle( poolSize );
        poolConfig.setMinIdle( poolSize );
        poolConfig.setMaxTotal( poolSize );
        return poolConfig;
    }

    // Start initialization of N renderers in the pool, asynchronously
    private void asyncInitRenderers()
    {
        final ExecutorService asyncInitializer = Executors.newSingleThreadExecutor();

        try
        {
            // First Renderer is expensive to make. Don't allow to first Renderer to be created in parallel with others.
            // The following ones may reuse precompiled scripts, so they are not that expensive to create even in parallel.
            asyncInitializer.submit( () -> {
                try
                {
                    rendererPool.addObject();
                }
                catch ( Exception e )
                {
                    LOG.error( "Error during async init first Renderer", e );
                }
                finally
                {
                    latch.countDown();
                }
            } );
            asyncInitializer.submit( () -> {
                try
                {
                    rendererPool.preparePool();
                }
                catch ( final Exception e )
                {
                    LOG.error( "Error during async init Renderers", e );
                }
            } );

        }
        finally
        {
            asyncInitializer.shutdown();
        }
    }

    ////////////////////////////////////////////////////////////////////////// RENDER

    public Map<String, String> render( String entryName, String props, String[] dependencyNames )
    {
        Renderer renderer = null;
        Map<String, String> result;

        try
        {
            latch.await();
            renderer = rendererPool.borrowObject();
            result = renderer.render( entryName, props, dependencyNames );

        }
        catch ( Exception e1 )
        {
            LOG.error( new ErrorHandler().getLoggableStackTrace( e1, null ) );
            result = Map.of( ErrorHandler.KEY_ERROR, e1.getMessage() );
        }
        finally
        {
            if ( renderer != null )
            {
                rendererPool.returnObject( renderer );
            }
        }

        return result;
    }
}
