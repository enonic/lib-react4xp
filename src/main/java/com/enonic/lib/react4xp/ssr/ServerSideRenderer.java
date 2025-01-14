package com.enonic.lib.react4xp.ssr;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.function.Supplier;

import org.apache.commons.pool2.impl.GenericObjectPool;
import org.apache.commons.pool2.impl.GenericObjectPoolConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.enonic.lib.react4xp.ssr.errors.ErrorHandler;
import com.enonic.lib.react4xp.ssr.renderer.Renderer;
import com.enonic.lib.react4xp.ssr.renderer.RendererFactory;
import com.enonic.lib.react4xp.ssr.resources.ResourceReader;
import com.enonic.lib.react4xp.ssr.resources.ResourceReaderImpl;
import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.resource.ResourceService;
import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;


public class ServerSideRenderer
    implements ScriptBean
{
    private static final Logger LOG = LoggerFactory.getLogger( ServerSideRenderer.class );

    private final AtomicBoolean isInitialized = new AtomicBoolean();

    private final CountDownLatch latch = new CountDownLatch( 1 );

    private GenericObjectPool<Renderer> rendererPool;

    private Supplier<ResourceService> resourceServiceSupplier;

    @Override
    public void initialize( BeanContext context )
    {
        this.resourceServiceSupplier = context.getService( ResourceService.class );
    }

    public void setup( String appName, String scriptsHome, String libraryName, String chunkfilesHome, String entriesJsonFilename,
                       String chunksGlobalsJsonFilename, String statsComponentsFilename, Integer ssrMaxThreads )
    {
        if ( isInitialized.compareAndSet( false, true ) )
        {
            try
            {
                int poolSize = ( ssrMaxThreads == null || ssrMaxThreads < 1 ) ? Runtime.getRuntime().availableProcessors() : ssrMaxThreads;

                LOG.debug( "Setting up SSR with {} engine{}...", poolSize, ( poolSize == 1 ? "" : "s" ) );

                final Config config =
                    new Config( appName, scriptsHome, libraryName, chunkfilesHome, entriesJsonFilename, chunksGlobalsJsonFilename,
                                statsComponentsFilename );

                final ResourceReader resourceReader = new ResourceReaderImpl( resourceServiceSupplier, ApplicationKey.from( config.APP_NAME ) );
                final RendererFactory rendererFactory = new RendererFactory( resourceReader, config );

                rendererPool = new GenericObjectPool<>( rendererFactory, createPoolConfig( poolSize ) );
            }
            finally
            {
                LOG.debug( "SSR is ready." );
                latch.countDown();
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

    public Map<String, String> render( String entryName, String props, String[] dependencyNames )
    {
        Renderer renderer = null;
        Map<String, String> result;

        try
        {
            if ( LOG.isDebugEnabled() )
            {
                if ( latch.getCount() != 0 )
                {
                    LOG.debug( "Waiting for SSR to be ready..." );
                }
            }
            latch.await();
            renderer = rendererPool.borrowObject();
            result = renderer.render( entryName, props, dependencyNames );

        }
        catch ( Exception e )
        {
            LOG.error( new ErrorHandler().getLoggableStackTrace( e, null ) );
            result = Map.of( ErrorHandler.KEY_ERROR, e.getMessage() );
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
