package com.enonic.lib.react4xp.ssr;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
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


public class ServerSideRenderer implements ScriptBean {
    private static final Logger LOG = LoggerFactory.getLogger( ServerSideRenderer.class );

    private final GenericObjectPoolConfig<Renderer> poolConfig = new GenericObjectPoolConfig<>();
    private GenericObjectPool<Renderer> rendererPool;
    private boolean isInitialized = false;

	private final ExecutorService asyncInitializer = Executors.newCachedThreadPool();
    private Supplier<ResourceService> resourceServiceSupplier;

    ////////////////////////////////////////////////////////////////////////// Bean init

    @Override
    public void initialize(BeanContext context) {
        this.resourceServiceSupplier = context.getService(ResourceService.class);
    }




    ////////////////////////////////////////////////////////////////////////// INIT

    public void setup(
            String appName,
            String scriptsHome,
            String libraryName,
            String chunkfilesHome,
            String entriesJsonFilename,
            String chunksExternalsJsonFilename,
            String statsComponentsFilename,
            boolean lazyload,
            Integer ssrMaxThreads,
            String engineName,
            String[] scriptEngineSettings
    ) {
        // There can be only one poolConfig, so this will only happen once.
        synchronized (poolConfig) {
            if (!isInitialized) {
                int poolSize = (ssrMaxThreads == null || ssrMaxThreads < 1)
                        ? Runtime.getRuntime().availableProcessors()
                        : ssrMaxThreads;

                LOG.debug("Setting up " + (lazyload ? "lazy-loading " : "") + "SSR with " + poolSize + " engine" + (poolSize == 1 ? "" : "s") + "...");

				final Config config = new Config(appName, scriptsHome, libraryName, chunkfilesHome, entriesJsonFilename, chunksExternalsJsonFilename, statsComponentsFilename, lazyload);

                ResourceReader resourceReader = new ResourceReaderImpl( resourceServiceSupplier, config, 0);
                EngineFactory engineFactory = new EngineFactory(engineName, scriptEngineSettings, resourceReader);
                RendererFactory rendererFactory = new RendererFactory(engineFactory, resourceReader, config);

                configPool( poolSize );

                rendererPool = new GenericObjectPool<>(rendererFactory, poolConfig);

                // When eager-loading, init all the renderers. All ready to go!
                if (!lazyload) {
                    asyncInitRenderers();
                }

                isInitialized = true;
            }
        }
    }


    private void configPool( int poolSize) {
        poolConfig.setLifo(false);
		poolConfig.setMaxWait( Duration.ofMillis( 200000 ) );
        poolConfig.setTestOnReturn(true);
        poolConfig.setMaxIdle(poolSize);
        poolConfig.setMaxTotal(poolSize);
        poolConfig.setMinIdle(poolSize);
    }

    // Start initialization of N renderers in the pool, asynchronously
    private void asyncInitRenderers()
    {
        for ( int i = 0; i < rendererPool.getMinIdle(); i++ )
        {
            asyncInitializer.submit( () -> {
                try
                {
                    rendererPool.addObject();
                }
                catch ( Exception e )
                {
                    LOG.error( "Error during async init", e );
                }
            } );
        }
    }

    ////////////////////////////////////////////////////////////////////////// RENDER

    public Map<String, String> render(String entryName, String props, String dependencyNames) {
        Renderer renderer = null;
        Map<String, String> result;

		try {
			renderer = rendererPool.borrowObject();
			result = renderer.render(entryName, props, dependencyNames);

        } catch (Exception e1) {
            LOG.error(new ErrorHandler().getLoggableStackTrace(e1, null));
            result = Map.of(ErrorHandler.KEY_ERROR, e1.getMessage());

        } finally {
            if (renderer != null) {
                rendererPool.returnObject(renderer);
            }
        }

        return result;
    }
}
