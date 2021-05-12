package com.enonic.lib.react4xp.ssr.pool;

import com.enonic.lib.react4xp.ssr.Config;
import com.enonic.lib.react4xp.ssr.engineFactory.EngineFactory;
import com.enonic.lib.react4xp.ssr.resources.ResourceReader;
import org.apache.commons.pool2.PooledObject;
import org.apache.commons.pool2.PooledObjectFactory;
import org.apache.commons.pool2.impl.DefaultPooledObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.concurrent.atomic.AtomicLong;

public class RendererFactory implements PooledObjectFactory<Renderer> {
    private final static Logger LOG = LoggerFactory.getLogger( RendererFactory.class );

    private final EngineFactory engineFactory;
    private final ResourceReader resourceReader;
    private final Config config;

    private final AtomicLong id = new AtomicLong(0);

    public RendererFactory(EngineFactory engineFactory, ResourceReader resourceReader, Config config) {
        this.engineFactory = engineFactory;
        this.resourceReader = resourceReader;
        this.config = config;
    }

    @Override
    public PooledObject<Renderer> makeObject() throws Exception {
        Renderer renderer = new Renderer(engineFactory, resourceReader, config, id.incrementAndGet());
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
