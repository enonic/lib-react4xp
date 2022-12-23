package com.enonic.lib.react4xp.ssr.pool;

import java.util.concurrent.atomic.AtomicLong;

import org.apache.commons.pool2.BasePooledObjectFactory;
import org.apache.commons.pool2.PooledObject;
import org.apache.commons.pool2.impl.DefaultPooledObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.enonic.lib.react4xp.ssr.Config;
import com.enonic.lib.react4xp.ssr.RendererCache;
import com.enonic.lib.react4xp.ssr.engineFactory.EngineFactory;
import com.enonic.lib.react4xp.ssr.resources.ResourceReader;

public class RendererFactory extends BasePooledObjectFactory<Renderer>
{
    private final static Logger LOG = LoggerFactory.getLogger( RendererFactory.class );

    private final EngineFactory engineFactory;
    private final ResourceReader resourceReader;
    private final Config config;
    private final RendererCache rendererCache;

    private final AtomicLong id = new AtomicLong(0);

    public RendererFactory( EngineFactory engineFactory, ResourceReader resourceReader, Config config) {
        this.engineFactory = engineFactory;
        this.resourceReader = resourceReader;
        this.config = config;
        this.rendererCache = new RendererCache();
    }

    @Override
    public Renderer create() {
        return new Renderer(engineFactory, resourceReader, config, id.incrementAndGet(), rendererCache);
    }

    @Override
    public PooledObject<Renderer> wrap( final Renderer renderer )
    {
        return new DefaultPooledObject<>( renderer );
    }
}
