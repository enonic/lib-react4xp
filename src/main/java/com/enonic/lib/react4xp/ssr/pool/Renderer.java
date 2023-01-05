package com.enonic.lib.react4xp.ssr.pool;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

import javax.script.Invocable;
import javax.script.ScriptEngine;
import javax.script.ScriptException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.enonic.lib.react4xp.ssr.Config;
import com.enonic.lib.react4xp.ssr.ServerSideRenderer;
import com.enonic.lib.react4xp.ssr.engineFactory.EngineFactory;
import com.enonic.lib.react4xp.ssr.errors.ErrorHandler;
import com.enonic.lib.react4xp.ssr.errors.RenderException;
import com.enonic.lib.react4xp.ssr.resources.AssetLoader;
import com.enonic.lib.react4xp.ssr.resources.ChunkDependencyParser;
import com.enonic.lib.react4xp.ssr.resources.ResourceReader;

import static com.enonic.lib.react4xp.ssr.errors.ErrorHandler.KEY_ERROR;
import static com.enonic.lib.react4xp.ssr.errors.ErrorHandler.KEY_STACKTRACE;


public class Renderer {
    private final static Logger LOG = LoggerFactory.getLogger( Renderer.class );

    private final long id;

    //public static final boolean IS_PRODMODE = (RunMode.get() == RunMode.PROD);

    private final ScriptEngine engine;

    private final Config config;

    private final AssetLoader assetLoader;

    public static final String KEY_HTML = "html";

    public Renderer( EngineFactory engineFactory, ResourceReader resourceReader, Config config, long id) {
        this.id = id;

        LOG.debug("{}: starting init {}...", this, (config.LAZYLOAD ? " (lazyloading)" : ""));

        this.config = config;

        try {
            engine = engineFactory.buildEngine(id);

            assetLoader = new AssetLoader( resourceReader, config.SCRIPTS_HOME, id, engine );

            final List<String> dependencies = new ChunkDependencyParser( engine, resourceReader ).getScriptDependencyNames( config );

            assetLoader.loadAssetsIntoEngine( dependencies );

            LOG.debug("{}: init is done.", this);

        } catch (Exception e) {
            throw new RenderException(e, "Couldn't init " + this);
        }
    }

    ///////////////////////////////////////////////////////////////////////////////

    private Map<String, String> runSSR( String entry, String props, List<String> assetsInvolved )
    {
        try
        {
            final Invocable invocable = (Invocable) engine;
            final Object propsJson = invocable.invokeMethod( engine.get( "JSON" ), "parse", props );
            final Map<String, Object> entryObject =
                (Map<String, Object>) ( (Map<String, Object>) engine.get( config.LIBRARY_NAME ) ).get( entry );
            final Function<Object, Object[]> defaultFunction = (Function<Object, Object[]>) entryObject.get( "default" );

            final Object entryWithProps = defaultFunction.apply( new Object[]{propsJson} );

            final String renderedHtml = (String) invocable.invokeMethod( engine.get( "ReactDOMServer" ), "renderToString", entryWithProps );

            return Map.of( KEY_HTML, renderedHtml );
        }
        catch ( ScriptException e )
        {
            ErrorHandler errorHandler = new ErrorHandler();
            String cleanErrorMessage = errorHandler.getCleanErrorMessage( e );
            String call = config.LIBRARY_NAME + "['" + entry + "'].default(" + props + ")";
            LOG.error( ( e.getMessage() + "\n" ) + errorHandler.getLoggableStackTrace( e, cleanErrorMessage ) + "\n\n" +
                           e.getClass().getSimpleName() + ": " + cleanErrorMessage + "\n" + "in " + ServerSideRenderer.class.getName() +
                           ".runSSR\n" + "Entry: '" + entry + "'\n" + "Assets involved:\n\t" + String.join( "\n\t", assetsInvolved ) +
                           "\n" + "Failing call: '" + call + "'\n" + errorHandler.getSolutionTips() );

            return Map.of( KEY_ERROR, cleanErrorMessage );
        }
        catch ( NoSuchMethodException e )
        {
            throw new RuntimeException( e );
        }
    }

    /**
     * Renders an entry to an HTML string.
     * @param entryName name of a transpiled JSX component, i.e. jsxPath: the filextension-less path to the compiled entry asset under assets/react4xp/, e.g: "site/parts/simple-reactive/simple-reactive"
     * @param props valid stringified JSON object: the entry's react props, e.g. '{"insertedMessage": "this is a prop!"}'
     * @param dependencyNames valid array: a set of file names to load into the engine (if not already done during initialization), needed by the entry before running it
     * @return {Map} Under the key 'html' (KEY_HTML), naked rendered HTML if successful. Under the key 'error' (KEY_ERROR), error message if failed.
     */
    public Map<String, String> render(String entryName, String props, String[] dependencyNames) {
        try {
            List<String> runnableAssetNames = Arrays.asList( dependencyNames );
            LOG.debug("{}: runnableAssetNames '{}'", this, runnableAssetNames);

            assetLoader.loadAssetsIntoEngine(runnableAssetNames);
            return runSSR( entryName, props, runnableAssetNames);

        } catch (RenderException r) {
            ErrorHandler errorHandler = new ErrorHandler();
            LOG.error(errorHandler.getLoggableStackTrace(r, null));
            return Map.of(
                    KEY_ERROR, r.getMessage()
            );

        } catch (Exception e) {
            ErrorHandler errorHandler = new ErrorHandler();
            LOG.error(errorHandler.getLoggableStackTrace(e, null));
            return Map.of(
                    KEY_ERROR, e.getClass().getName() + ": " + e.getMessage()
            );
        }
    }



    /////////////////////////////////////////////////////////////////////////////// Identity

    public String toString() {
        return Renderer.class.getSimpleName() + "#" + id;
    }

}
