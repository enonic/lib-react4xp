package com.enonic.lib.react4xp.ssr.renderer;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

import org.graalvm.polyglot.Context;
import org.graalvm.polyglot.Engine;
import org.graalvm.polyglot.PolyglotException;
import org.graalvm.polyglot.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.enonic.lib.react4xp.ssr.Config;
import com.enonic.lib.react4xp.ssr.ServerSideRenderer;
import com.enonic.lib.react4xp.ssr.engine.EngineFactory;
import com.enonic.lib.react4xp.ssr.errors.ErrorHandler;
import com.enonic.lib.react4xp.ssr.resources.AssetLoader;
import com.enonic.lib.react4xp.ssr.resources.ResourceReader;
import com.enonic.lib.react4xp.ssr.resources.SourceProvider;

import static com.enonic.lib.react4xp.ssr.errors.ErrorHandler.KEY_ERROR;


public class Renderer
{
    private final static Logger LOG = LoggerFactory.getLogger( Renderer.class );

    public static final String KEY_HTML = "html";

    private static final String POLYFILL_BASICS_FILE = "/lib/enonic/polyfill-react4xp/polyfillBasics.js";

    private static final String POLYFILL_REACT4XP_NODE_FILE = "/lib/enonic/polyfill-react4xp/nodePolyfills.js";

    private final long id;

    private final Context context;

    private final String libraryName;

    private final AssetLoader assetLoader;

    private final String appName;

    public Renderer( final ResourceReader resourceReader, final Config config, final long id, final Engine engine,
                     final SourceProvider sourceProvider )
    {
        this.id = id;
        this.libraryName = config.LIBRARY_NAME;
        this.appName = config.APP_NAME;

        LOG.debug( "#{}:{} starting init...", this.id, this.libraryName );

        this.context = EngineFactory.buildContext( engine );

        this.assetLoader = new AssetLoader( resourceReader, config.SCRIPTS_HOME, id, context, sourceProvider );

        LOG.debug( "#{}:{} loading polyfills ...", this.id, this.libraryName );

        this.assetLoader.loadAssetIntoEngine( POLYFILL_BASICS_FILE, true );
        this.assetLoader.loadAssetIntoEngine( POLYFILL_REACT4XP_NODE_FILE, true );

        LOG.debug( "#{}:{} loading globals...", this.id, this.libraryName );

        final String globalsChunkFile = config.CHUNKFILES_HOME + config.CHUNKSGLOBALS_JSON_FILENAME;

        final List<String> dependencies = getScriptDependencyNames( parseJson( resourceReader.readResource( globalsChunkFile ) ) );

        this.assetLoader.loadAssetsIntoEngine( dependencies );

        LOG.debug( "#{}:{} init is done.", this.id, this.libraryName );
    }

    /**
     * Renders an entry to an HTML string.
     *
     * @param entryName       name of a transpiled JSX component, i.e. jsxPath: the filextension-less path to the compiled entry asset under assets/react4xp/, e.g: "site/parts/simple-reactive/simple-reactive"
     * @param props           valid stringified JSON object: the entry's react props, e.g. '{"insertedMessage": "this is a prop!"}'
     * @param dependencyNames valid array: a set of file names to load into the engine (if not already done during initialization), needed by the entry before running it
     * @return {Map} Under the key 'html' (KEY_HTML), naked rendered HTML if successful. Under the key 'error' (KEY_ERROR), error message if failed.
     */
    public Map<String, String> render( final String entryName, final String props, final String[] dependencyNames )
    {
        List<String> jsDependencies = Arrays.stream( dependencyNames ).filter( fileName -> fileName.endsWith( ".js" ) ).toList();
        LOG.debug( "#{}:{} render {}", this.id, this.libraryName, entryName );
        try
        {
            this.assetLoader.loadAssetsIntoEngine( jsDependencies );

            final Value bindings = context.getBindings( "js" );
            final Value libValue = bindings.getMember( libraryName );
            if ( libValue == null || libValue.isNull() )
            {
                throw new IllegalStateException( libraryName + " is not found in engine" );
            }

            if ( LOG.isDebugEnabled() )
            {
                LOG.debug( "#{}:{} available entries {}", this.id, this.libraryName, libValue.getMemberKeys() );
            }

            final Value entryValue = libValue.getMember( entryName );
            if ( entryValue == null || entryValue.isNull() )
            {
                throw new IllegalStateException( entryName + " is not found in " + libraryName );
            }

            final Value propsJson = parseJson( props );
            final Value entryWithProps = entryValue.getMember( "default" ).execute( propsJson );

            final Value renderOpts = parseJson( "{\"identifierPrefix\": \"" + this.appName + "\"}" );

            final String renderedHtml =
                bindings.getMember( "ReactDOMServer" ).getMember( "renderToString" ).execute( entryWithProps, renderOpts ).asString();

            return Map.of( KEY_HTML, renderedHtml );
        }
        catch ( PolyglotException e )
        {
            ErrorHandler errorHandler = new ErrorHandler();
            String cleanErrorMessage = errorHandler.getCleanErrorMessage( e );
            String call = libraryName + "['" + entryName + "'].default(" + props + ")";
            LOG.error( "{}\n{}\n\n{}: {}\nin {}.runSSR\nEntry: '{}'\nAssets involved:\n\t{}\nFailing call: '{}'\n{}", e.getMessage(),
                       errorHandler.getLoggableStackTrace( e, cleanErrorMessage ), e.getClass().getSimpleName(), cleanErrorMessage,
                       ServerSideRenderer.class.getName(), entryName, String.join( "\n\t", jsDependencies ), call,
                       errorHandler.getSolutionTips() );

            return Map.of( KEY_ERROR, cleanErrorMessage );
        }
    }

    /**
     * Reads and parses file names from webpack-generated JSON files that list up content-hashed bundle chunk names.
     *
     * @param chunksData parsed JSON value of chunk data
     * @return bundle chunk names
     */
    private static List<String> getScriptDependencyNames( final Value chunksData )
    {
        return chunksData.getMemberKeys().stream().map( key -> {
            final Value chunk = chunksData.getMember( key );
            final Value fetchedChunk = chunk.getMember( "js" );

            if ( fetchedChunk.isString() )
            {
                return fetchedChunk.asString();
            }
            else
            {
                if ( fetchedChunk.getArraySize() != 1 )
                {
                    throw new IllegalStateException( "Unexpected JSON chunk format, expected exactly 1 item in array. Chunk: " + chunk );
                }
                return fetchedChunk.getArrayElement( 0 ).asString();
            }
        } ).distinct().toList();
    }

    private Value parseJson( String json )
    {
        return context.getBindings( "js" ).getMember( "JSON" ).getMember( "parse" ).execute( json );
    }

    public void close()
    {
        context.close();
    }
}
