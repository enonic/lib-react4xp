package com.enonic.lib.react4xp.ssr.pool;

import com.enonic.lib.react4xp.ssr.Config;
import com.enonic.lib.react4xp.ssr.engineFactory.EngineFactory;
import com.enonic.xp.resource.ResourceService;
import org.apache.commons.pool2.PooledObject;
import org.apache.commons.pool2.PooledObjectFactory;
import org.apache.commons.pool2.impl.DefaultPooledObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.concurrent.atomic.AtomicLong;
import java.util.function.Supplier;

public class RendererFactory implements PooledObjectFactory<Renderer> {
    private final static Logger LOG = LoggerFactory.getLogger( RendererFactory.class );

    private final Config config;
    private final EngineFactory engineFactory;
    private final Supplier<ResourceService> resourceServiceSupplier;

    private final AtomicLong id = new AtomicLong(0);

    public RendererFactory(EngineFactory engineFactory, Supplier<ResourceService> resourceServiceSupplier, Config config) {
        this.config = config;
        this.engineFactory = engineFactory;
        this.resourceServiceSupplier = resourceServiceSupplier;
    }

    @Override
    public PooledObject<Renderer> makeObject() throws Exception {
        Renderer renderer = new Renderer(engineFactory, resourceServiceSupplier, config, id.incrementAndGet());
        return new DefaultPooledObject<>(renderer);
    }

    @Override
    public void destroyObject(PooledObject<Renderer> p) throws Exception {
        p.getObject().destroy();
    }

    @Override
    public boolean validateObject(PooledObject<Renderer> p) {
        return p.getObject().validate();
    }

    @Override
    public void activateObject(PooledObject<Renderer> p) throws Exception {
        //p.getObject().activate();

    }

    @Override
    public void passivateObject(PooledObject<Renderer> p) throws Exception {
        //p.getObject().passivate();
    }
}
