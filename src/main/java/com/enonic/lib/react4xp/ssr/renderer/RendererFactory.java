package com.enonic.lib.react4xp.ssr.renderer;

import java.util.concurrent.atomic.AtomicLong;

import org.apache.commons.pool2.BasePooledObjectFactory;
import org.apache.commons.pool2.PooledObject;
import org.apache.commons.pool2.impl.DefaultPooledObject;

import com.enonic.lib.react4xp.ssr.Config;
import com.enonic.lib.react4xp.ssr.resources.ResourceReader;

public class RendererFactory extends BasePooledObjectFactory<Renderer>
{
    private final ResourceReader resourceReader;

    private final Config config;

    private final AtomicLong id = new AtomicLong(0);

    public RendererFactory( ResourceReader resourceReader, Config config )
    {
        this.resourceReader = resourceReader;
        this.config = config;
    }

    @Override
    public Renderer create()
    {
        return new Renderer( resourceReader, config, id.incrementAndGet() );
    }

    @Override
    public PooledObject<Renderer> wrap( final Renderer renderer )
    {
        return new DefaultPooledObject<>( renderer );
    }
}
