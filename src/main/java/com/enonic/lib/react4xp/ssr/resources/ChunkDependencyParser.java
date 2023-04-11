package com.enonic.lib.react4xp.ssr.resources;

import java.io.IOException;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.script.Bindings;
import javax.script.Invocable;
import javax.script.ScriptEngine;
import javax.script.ScriptException;

import com.enonic.lib.react4xp.ssr.Config;

/** Reads and parses file names from webpack-generated JSON files that list up content-hashed bundle chunk names. */
public class ChunkDependencyParser {

    private final ScriptEngine engine;

    private final ResourceReader resourceReader;

    public ChunkDependencyParser( final ScriptEngine engine, final ResourceReader resourceReader )
    {
        this.engine = engine;
        this.resourceReader = resourceReader;
    }

    public List<String> getScriptDependencyNames( Config config )
        throws IOException
    {
        final String globalsChunkFile = config.CHUNKFILES_HOME + config.CHUNKSGLOBALS_JSON_FILENAME;
        final List<String> globalsDependencies = getDependencyNamesFromChunkFile( resourceReader.readResource( globalsChunkFile ) );

        return globalsDependencies.stream().distinct().collect( Collectors.toList() );
    }

    private List<String> getDependencyNamesFromChunkFile( String source )
    {
        final Map<String, Object> chunksData = (Map<String, Object>) parseJson( source );

        return chunksData.values().stream().map( value -> {
            final Map<String, Object> chunk = (Map<String, Object>) value;
            final Object fetchedChunk = chunk.get( "js" );

            if ( fetchedChunk instanceof String )
            {
                return (String) fetchedChunk;
            }
            else
            {
                final List<String> arr = adaptList( fetchedChunk );
                if ( arr.size() != 1 )
                {
                    throw new IllegalStateException( "Unexpected JSON chunk format, expected exactly 1 item in array. Chunk: " + chunk );
                }
                return arr.get( 0 );
            }

        } ).collect( Collectors.toList() );
    }

    private Object parseJson( String json )
    {
        final Invocable invocable = (Invocable) engine;
        try
        {
            return invocable.invokeMethod( engine.get( "JSON" ), "parse", json );
        }
        catch ( ScriptException | NoSuchMethodException e )
        {
            throw new RuntimeException( e );
        }
    }

    private static <T> List<T> adaptList( final Object object )
    {
        if ( object instanceof List )
        {
            return (List<T>) object;
        }
        else if ( object instanceof Bindings ) // Nashorn case
        {
            return List.copyOf( (Collection<T>) ( (Bindings) object ).values() );
        }
        else
        {
            throw new IllegalArgumentException( "object is not a list" );
        }
    }
}
