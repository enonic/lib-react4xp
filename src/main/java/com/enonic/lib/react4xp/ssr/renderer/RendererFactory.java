package com.enonic.lib.react4xp.ssr.renderer;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.atomic.AtomicLong;

import org.apache.commons.pool2.BasePooledObjectFactory;
import org.apache.commons.pool2.PooledObject;
import org.apache.commons.pool2.impl.DefaultPooledObject;
import org.graalvm.polyglot.Engine;
import org.graalvm.polyglot.Source;

import com.enonic.lib.react4xp.ssr.Config;
import com.enonic.lib.react4xp.ssr.engine.EngineFactory;
import com.enonic.lib.react4xp.ssr.resources.ResourceReader;
import com.enonic.lib.react4xp.ssr.resources.SourceProvider;
import com.enonic.xp.server.RunMode;

public class RendererFactory extends BasePooledObjectFactory<Renderer> implements AutoCloseable
{
    private final ResourceReader resourceReader;

    private final Config config;

    private final Engine engine;

    private final AtomicLong id = new AtomicLong( 0 );

    // Strong references to Source objects so the engine's per-Source code cache survives GC.
    // Without this, eval(String) overload constructs an internal Source per call that becomes
    // unreachable, and its cache entry gets evicted under GC pressure (e.g. pool warmup under load).
    // See https://www.graalvm.org/latest/reference-manual/embed-languages/#code-caching-across-multiple-contexts
    //
    // BOUNDEDNESS: keys are JS asset paths from AssetLoader (polyfill files, globals chunks,
    // per-entry chunks). The set of distinct paths is fixed at build time, so this map can't
    // grow unbounded. See SourceProvider's Javadoc — any new caller must preserve that invariant.
    private final ConcurrentMap<String, Source> sourceCache = new ConcurrentHashMap<>();

    private final SourceProvider sourceProvider = this::buildOrReuseSource;

    public RendererFactory( ResourceReader resourceReader, Config config )
    {
        this.resourceReader = resourceReader;
        this.config = config;
        this.engine = EngineFactory.buildSharedEngine();
    }

    @Override
    public Renderer create()
    {
        return new Renderer( resourceReader, config, id.incrementAndGet(), engine, sourceProvider );
    }

    @Override
    public PooledObject<Renderer> wrap( final Renderer renderer )
    {
        return new DefaultPooledObject<>( renderer );
    }

    @Override
    public void destroyObject( final PooledObject<Renderer> p )
    {
        p.getObject().close();
    }

    @Override
    public void close()
    {
        sourceCache.clear();
        engine.close();
    }

    private Source buildOrReuseSource( final String name, final String content )
    {
        // In DEV the same path can have changing content; building fresh each time mirrors what
        // AssetLoader.assetLoadedMarkers does (only marks loaded in PROD).
        if ( RunMode.get() != RunMode.PROD )
        {
            return buildSource( name, content );
        }
        return sourceCache.computeIfAbsent( name, n -> buildSource( n, content ) );
    }

    private static Source buildSource( final String name, final String content )
    {
        try
        {
            return Source.newBuilder( "js", content, name ).build();
        }
        catch ( IOException e )
        {
            // Source.newBuilder declares IOException for the file/URL overloads; with a literal
            // CharSequence content it can't actually throw, but the checked signature forces this.
            throw new UncheckedIOException( e );
        }
    }
}
