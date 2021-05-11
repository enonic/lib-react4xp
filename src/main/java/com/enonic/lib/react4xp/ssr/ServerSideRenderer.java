package com.enonic.lib.react4xp.ssr;

import com.enonic.lib.react4xp.ssr.engineFactory.EngineFactory;
import com.enonic.lib.react4xp.ssr.errors.ErrorHandler;
import com.enonic.lib.react4xp.ssr.pool.Renderer;
import com.enonic.lib.react4xp.ssr.pool.RendererFactory;
import com.enonic.xp.resource.ResourceService;
import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;
import org.apache.commons.pool2.impl.GenericObjectPool;
import org.apache.commons.pool2.impl.GenericObjectPoolConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;
import java.util.function.Supplier;




public class ServerSideRenderer implements ScriptBean {
    private final static Logger LOG = LoggerFactory.getLogger( ServerSideRenderer.class );

    private static final GenericObjectPoolConfig<Renderer> poolConfig = new GenericObjectPoolConfig<>();
    private static GenericObjectPool<Renderer> rendererPool;
    private static boolean isInitialized = false;

    private Config config;
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
            String userAddedNashornpolyfillsFilename,
            String entriesJsonFilename,
            String chunksExternalsJsonFilename,
            String statsComponentsFilename,
            boolean lazyload,
            Integer ssrMaxThreads,
            String[] scriptEngineSettings
    ) {
        // There can be only one poolConfig, so this will only happen once.
        synchronized (poolConfig) {
            if (!isInitialized) {
                LOG.info("Initializing SSR engine(s)...");

                int threadCount = (ssrMaxThreads == null || ssrMaxThreads < 1)
                        ? Runtime.getRuntime().availableProcessors()
                        : ssrMaxThreads;

                config = new Config(appName, scriptsHome, libraryName, chunkfilesHome, entriesJsonFilename, chunksExternalsJsonFilename, statsComponentsFilename, userAddedNashornpolyfillsFilename, lazyload, threadCount);
                EngineFactory engineFactory = new EngineFactory(scriptEngineSettings);
                RendererFactory rendererFactory = new RendererFactory(engineFactory, resourceServiceSupplier, config);



                setPoolConfig(threadCount);

                rendererPool = new GenericObjectPool<>(rendererFactory, poolConfig);

                // When eager-loading, init all the renderers. All ready to go!
                if (!lazyload) {
                    asyncInitRenderers(threadCount);
                }

                LOG.info("SSR engine(s) initialized.");
                isInitialized = true;
            }
        }

    }


    private void setPoolConfig(Integer threadCount) {
        poolConfig.setLifo(true);
        poolConfig.setMaxWaitMillis(20000);
        poolConfig.setTestOnBorrow(false);
        poolConfig.setTestOnReturn(true);
        poolConfig.setMaxIdle(threadCount);
        poolConfig.setMaxTotal(threadCount);
        poolConfig.setMinIdle(threadCount);
    }

    // Start initialization of N renderers in the pool, asynchronously
    private void asyncInitRenderers(int threadCount) {
        for (int i=0; i<threadCount; i++) {
            new AsyncPoolRendererInitializer().start();
        }
    }

    // Init a new renderer in the pool, asynchronously:
    private class AsyncPoolRendererInitializer extends Thread {

        public void run() {
            Renderer renderer = null;
            try {
                renderer = rendererPool.borrowObject();

                // Why sleep? When initializing multiple Renderers at once, this prevents them from borrowing one and returning
                // that before the next one is borrowed: if a non-destroyed Renderer is cycled like that, nothing is actually initialized.
                Thread.sleep(3);

            } catch (Exception e) {
                e.printStackTrace();
            }

            if (renderer != null) {
                rendererPool.returnObject(renderer);
            }
        }
    }





    ////////////////////////////////////////////////////////////////////////// RENDER

    public Map<String, String> render(String entryName, String props, String dependencyNames) {
        Renderer renderer = null;
        Map<String, String> result;

        try {
            renderer = rendererPool.borrowObject();
            result = renderer.render(entryName, props, dependencyNames);

        } catch (Exception e) {
            LOG.error(new ErrorHandler().getLoggableStackTrace(e, null));
            result = Map.of(ErrorHandler.KEY_ERROR, e.getMessage());
        }

        if (renderer != null) {
            rendererPool.returnObject(renderer);
        }

        // If an error occurred, force-init a new Renderer
        if (result == null || result.containsKey(ErrorHandler.KEY_ERROR) && !config.LAZYLOAD) {
            asyncInitRenderers(rendererPool.getNumIdle() + 1);
        }
        return result;
    }
}
