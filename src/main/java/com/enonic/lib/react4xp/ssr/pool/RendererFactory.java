package com.enonic.lib.react4xp.ssr.pool;

import javax.script.ScriptEngine;

import org.apache.commons.pool2.BasePooledObjectFactory;
import org.apache.commons.pool2.PooledObject;
import org.apache.commons.pool2.impl.DefaultPooledObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.enonic.lib.react4xp.ssr.Config;
import com.enonic.lib.react4xp.ssr.RendererCache;
import com.enonic.lib.react4xp.ssr.resources.ResourceReader;

public class RendererFactory extends BasePooledObjectFactory<Renderer>
{
    private final static Logger LOG = LoggerFactory.getLogger( RendererFactory.class );

    private final ScriptEngine scriptEngine;
    private final ResourceReader resourceReader;
    private final Config config;
    private final RendererCache rendererCache;

    private final long renderId;

    public RendererFactory( ScriptEngine scriptEngine, ResourceReader resourceReader, Config config, long renderId) {
        this.scriptEngine = scriptEngine;
        this.resourceReader = resourceReader;
        this.config = config;
        this.rendererCache = new RendererCache();
        this.renderId = renderId;
    }

    @Override
    public Renderer create()
    {
        return new Renderer( scriptEngine, resourceReader, config, renderId, rendererCache );
    }

    @Override
    public PooledObject<Renderer> wrap( final Renderer renderer )
    {
        return new DefaultPooledObject<>( renderer );
    }
}
