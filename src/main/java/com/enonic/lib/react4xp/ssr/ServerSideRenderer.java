package com.enonic.lib.react4xp.ssr;

import com.enonic.lib.react4xp.ssr.engineFactory.EngineFactory;
import com.enonic.xp.resource.ResourceService;
import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.script.ScriptException;
import java.io.IOException;
import java.util.Map;
import java.util.function.Supplier;




public class ServerSideRenderer implements ScriptBean {
    private final static Logger LOG = LoggerFactory.getLogger( ServerSideRenderer.class );


    // Singletons: engine factory and config
    private static EngineFactory engineFactory = null;
    private static Config config = null;

    // Constants. TODO: SHOULD BE final?
    private Renderer renderer = null;
    private Supplier<ResourceService> RESOURCE_SERVICE_SUPPLIER;


    @Override
    public void initialize(BeanContext context) {
        this.RESOURCE_SERVICE_SUPPLIER = context.getService(ResourceService.class);
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
            int ssrMaxThreads,
            String[] scriptEngineSettings
    ) {
                                                                                                                        LOG.info("##################### SSR setup: #" + Thread.currentThread().getId() + " ######################");
        long then = System.currentTimeMillis();
        synchronized (ServerSideRenderer.class) {
            if (engineFactory == null) {
                config = new Config(appName, scriptsHome, libraryName, chunkfilesHome, entriesJsonFilename, chunksExternalsJsonFilename, statsComponentsFilename, userAddedNashornpolyfillsFilename, lazyload);
                engineFactory = new EngineFactory(scriptEngineSettings);
            }
        }
        long now = System.currentTimeMillis();

                                                                                                                        LOG.info("##################### SSR setup done: #" + Thread.currentThread().getId() + " (" + (now-then) + " ms) ######################");
    }




    ////////////////////////////////////////////////////////////////////////// RENDER

    public Map<String, String> render(String entryName, String props, String dependencyNames) throws ScriptException, IOException {
                                                                                                                        LOG.info("### Rendering entry: " + entryName);
        long then = System.currentTimeMillis();
        if (renderer == null || !renderer.validate()) {
            renderer = new Renderer(Thread.currentThread().getId(), engineFactory, RESOURCE_SERVICE_SUPPLIER, config);
        }

        Map<String, String> rendered = renderer.render(entryName, props, dependencyNames);
        long now = System.currentTimeMillis();
                                                                                                                        LOG.info("### Entry " + entryName + " rendered (" + (now-then) + " ms)");
        return rendered;
    }
}
