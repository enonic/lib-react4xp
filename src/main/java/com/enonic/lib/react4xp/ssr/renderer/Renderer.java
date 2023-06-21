package com.enonic.lib.react4xp.ssr.renderer;

import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import javax.script.Bindings;
import javax.script.Invocable;
import javax.script.ScriptEngine;
import javax.script.ScriptException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.enonic.lib.react4xp.ssr.Config;
import com.enonic.lib.react4xp.ssr.ServerSideRenderer;
import com.enonic.lib.react4xp.ssr.engine.EngineFactory;
import com.enonic.lib.react4xp.ssr.errors.ErrorHandler;
import com.enonic.lib.react4xp.ssr.resources.AssetLoader;
import com.enonic.lib.react4xp.ssr.resources.ResourceReader;

import static com.enonic.lib.react4xp.ssr.errors.ErrorHandler.KEY_ERROR;


public class Renderer {
    private final static Logger LOG = LoggerFactory.getLogger( Renderer.class );

    public static final String KEY_HTML = "html";

    private static final String POLYFILL_BASICS_FILE = "/lib/enonic/polyfill-react4xp/polyfillBasics.js";

    private static final String POLYFILL_REACT4XP_NASHORN_FILE = "/lib/enonic/polyfill-react4xp/nashornPolyfills.js";

    private static final String POLYFILL_REACT4XP_NODE_FILE = "/lib/enonic/polyfill-react4xp/nodePolyfills.js";

    private static final String POLYFILL_REACT4XP_USER_ADDED_FILE = "/lib/enonic/react4xp/nashornPolyfills.userAdded.js";

    private final long id;

    private final ScriptEngine engine;

    private final String libraryName;

    private final AssetLoader assetLoader;

    public Renderer( final EngineFactory engineFactory, final ResourceReader resourceReader, final Config config, final long id )
    {
        this.id = id;
        this.libraryName = config.LIBRARY_NAME;

        LOG.debug( "#{}:{} starting init...", this.id, this.libraryName );

        this.engine = engineFactory.buildEngine();

        this.assetLoader = new AssetLoader( resourceReader, config.SCRIPTS_HOME, id, engine );

        LOG.debug( "#{}:{} loading polyfills ...", this.id, this.libraryName );

        this.assetLoader.loadAssetIntoEngine( POLYFILL_BASICS_FILE, true );
        if ( this.engine.getFactory().getEngineName().contains( "Nashorn" ) )
        {
            this.assetLoader.loadAssetIntoEngine( POLYFILL_REACT4XP_NASHORN_FILE, true );
        }
        this.assetLoader.loadAssetIntoEngine( POLYFILL_REACT4XP_NODE_FILE, true );
        this.assetLoader.loadAssetIntoEngine( POLYFILL_REACT4XP_USER_ADDED_FILE, false );

        LOG.debug( "#{}:{} loading globals...", this.id, this.libraryName );

        final String globalsChunkFile = config.CHUNKFILES_HOME + config.CHUNKSGLOBALS_JSON_FILENAME;

        final List<String> dependencies =
            getScriptDependencyNames( (Map<String, Object>) parseJson( resourceReader.readResource( globalsChunkFile ) ) );

        this.assetLoader.loadAssetsIntoEngine( dependencies );

        LOG.debug( "#{}:{} init is done.", this.id, this.libraryName );
    }

    /**
     * Renders an entry to an HTML string.
     * @param entryName name of a transpiled JSX component, i.e. jsxPath: the filextension-less path to the compiled entry asset under assets/react4xp/, e.g: "site/parts/simple-reactive/simple-reactive"
     * @param props valid stringified JSON object: the entry's react props, e.g. '{"insertedMessage": "this is a prop!"}'
     * @param dependencyNames valid array: a set of file names to load into the engine (if not already done during initialization), needed by the entry before running it
     * @return {Map} Under the key 'html' (KEY_HTML), naked rendered HTML if successful. Under the key 'error' (KEY_ERROR), error message if failed.
     */
    public Map<String, String> render( final String entryName, final String props, final String[] dependencyNames )
    {
        List<String> jsDependencies =
            Arrays.stream( dependencyNames ).filter( fileName -> fileName.endsWith( ".js" ) ).collect( Collectors.toList() );
        LOG.debug( "#{}:{} render {}", this.id, this.libraryName, entryName );
        try
        {
            this.assetLoader.loadAssetsIntoEngine( jsDependencies );

            final Invocable invocable = (Invocable) this.engine;
            final Map<String, Object> libObject = (Map<String, Object>) this.engine.get( libraryName );
            if ( libObject == null )
            {
                throw new IllegalStateException( libraryName + " is not found in engine" );
            }

            if ( LOG.isDebugEnabled() ) {
                LOG.debug( "#{}:{} available entries {}", this.id, this.libraryName, libObject.keySet() );
            }

            final Map<String, Object> entryObject = (Map<String, Object>) libObject.get( entryName );
            if ( entryObject == null )
            {
                throw new IllegalStateException( entryName + " is not found in " + libraryName );
            }

            final Object propsJson = parseJson( props );
            final Object entryWithProps;
            if ( entryObject.get( "default" ) instanceof Function )
            {
                // Graal.js fails to find "default" method when invokeMethod is used. Call directly
                // Hopefully will be fixed in future versions of Graal.js
                final Function<Object, Object[]> defaultFunction = (Function<Object, Object[]>) entryObject.get( "default" );
                entryWithProps = defaultFunction.apply( new Object[]{propsJson} );
            }
            else
            {
                entryWithProps = invocable.invokeMethod( entryObject, "default", propsJson );
            }

            final String renderedHtml = (String) invocable.invokeMethod( this.engine.get( "ReactDOMServer" ), "renderToString", entryWithProps );

            return Map.of( KEY_HTML, renderedHtml );
        }
        catch ( ScriptException e )
        {
            ErrorHandler errorHandler = new ErrorHandler();
            String cleanErrorMessage = errorHandler.getCleanErrorMessage( e );
            String call = libraryName + "['" + entryName + "'].default(" + props + ")";
            LOG.error( e.getMessage() + "\n" + errorHandler.getLoggableStackTrace( e, cleanErrorMessage ) + "\n\n" +
                           e.getClass().getSimpleName() + ": " + cleanErrorMessage + "\n" + "in " + ServerSideRenderer.class.getName() +
                           ".runSSR\n" + "Entry: '" + entryName + "'\n" + "Assets involved:\n\t" +
                           String.join( "\n\t", jsDependencies ) + "\n" + "Failing call: '" + call + "'\n" +
                           errorHandler.getSolutionTips() );

            return Map.of( KEY_ERROR, cleanErrorMessage );
        }
        catch ( Exception e )
        {
            ErrorHandler errorHandler = new ErrorHandler();
            LOG.error( errorHandler.getLoggableStackTrace( e, null ) );
            return Map.of( KEY_ERROR, e.getClass().getName() + ": " + e.getMessage() );
        }
    }

    /**
     * Reads and parses file names from webpack-generated JSON files that list up content-hashed bundle chunk names.
     * @param chunksData JSON-like map of chunk names
     * @return bundle chunk names
     */
    private static List<String> getScriptDependencyNames( final Map<String, Object> chunksData )
    {
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
        } ).distinct().collect( Collectors.toList() );
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
