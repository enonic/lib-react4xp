package com.enonic.lib.react4xp.ssr.resources;

import org.graalvm.polyglot.Source;

/**
 * Provides {@link Source} objects for JS to be eval'd into a GraalJS Context.
 *
 * <p>Implementations may cache Sources to keep the engine's per-Source code cache alive across
 * Contexts (see GraalVM "Code caching across multiple contexts" docs). When they do, it is the
 * caller's responsibility to ensure {@code name} comes from a <strong>bounded set of stable
 * asset paths</strong> — never user input, content hashes, request-derived values, or anything
 * else that could grow without bound. A misuse would turn the cache into an unbounded memory
 * leak.
 *
 * <p>Today the only call site is {@link AssetLoader#loadAssetIntoEngine}, which always passes
 * an asset path. New call sites must preserve that invariant or build their own non-caching
 * Source.
 */
@FunctionalInterface
public interface SourceProvider
{
    /**
     * @param name    stable, bounded identifier — typically a JS asset path. Used as the cache
     *                key by caching implementations.
     * @param content the JS source code to evaluate.
     */
    Source get( String name, String content );
}
