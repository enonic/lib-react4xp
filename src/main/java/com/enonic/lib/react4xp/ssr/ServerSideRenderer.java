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

import javax.script.ScriptException;
import java.io.IOException;
import java.util.Map;
import java.util.function.Supplier;




public class ServerSideRenderer implements ScriptBean {
    private final static Logger LOG = LoggerFactory.getLogger( ServerSideRenderer.class );


    // Singletons: engine factory and config
    //private static EngineFactory engineFactory = null;
    //private static Config config = null;

    // Constants. TODO: SHOULD BE final?
    //private Renderer renderer = null;
    private Supplier<ResourceService> resourceServiceSupplier;

    private static final GenericObjectPoolConfig<Renderer> poolConfig = new GenericObjectPoolConfig<>();
    private static GenericObjectPool<Renderer> rendererPool;
    private static boolean isInitialized = false;

    private Config config;

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

        synchronized (poolConfig) {
            if (!isInitialized) {
                                                                                                                        LOG.info("##################### SSR setup: #" + Thread.currentThread().getId() + " ######################");
                                                                                                                        long then = System.currentTimeMillis();
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

                                                                                                                        long now = System.currentTimeMillis();
                                                                                                                        LOG.info("##################### SSR setup is done: #" + Thread.currentThread().getId() + " (" + (now-then) + " ms) ######################");
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
                                                                                                                        private String rendererId = null;

        public void run() {
                                                                                                                        LOG.info("oooooooo Starting renderer init (thread#" + Thread.currentThread().getId() + ")");
                                                                                                                        long then = System.currentTimeMillis();
            Renderer renderer = null;
            try {
                renderer = rendererPool.borrowObject();
                rendererId = renderer.toString();

                // Why sleep? When initializing multiple Renderers at once, this prevents them from only initializing one and cycling that.
                Thread.sleep(3);

            } catch (Exception e) {
                e.printStackTrace();
            }


            if (renderer != null) {
                rendererPool.returnObject(renderer);
            }

                                                                                                                        long now = System.currentTimeMillis();
                                                                                                                        LOG.info("oooooooo " + rendererId + " init (thread#" + Thread.currentThread().getId() + ") is done (" + (now - then) + " ms)");

            // TODO: SEMAPHOR THIS? So that isInitiazlized isn't set to true to allow renderers before all threads are initialized? Is that necessary?
        }
    }





    ////////////////////////////////////////////////////////////////////////// RENDER

    public Map<String, String> render(String entryName, String props, String dependencyNames) throws ScriptException, IOException {
                                                                                                                        long then = System.currentTimeMillis();
        Renderer renderer = null;
        Map<String, String> result;
        String rendererId = null;

        try {
            renderer = rendererPool.borrowObject();
            rendererId = renderer.toString();

                                                                                                                        LOG.info("----- " + rendererId + " is starting render: '" + entryName);
            result = renderer.render(entryName, props, dependencyNames);

        } catch (Exception e) {
            LOG.error(new ErrorHandler().getLoggableStackTrace(e, null));
            result = Map.of(ErrorHandler.KEY_ERROR, e.getMessage());

        } finally {
            if (renderer != null) {
                rendererPool.returnObject(renderer);
            }
        }

        // If an error occurred, force-init a new Renderer
        if (result.containsKey(ErrorHandler.KEY_ERROR) && !config.lazyload) {
            asyncInitRenderers(rendererPool.getNumIdle() + 1);
        }

                                                                                                                        long now = System.currentTimeMillis();
                                                                                                                        LOG.info("----- " + rendererId + " finished rendering '" + entryName + "' (" + (now-then) + " ms)");
        return result;
    }
}
