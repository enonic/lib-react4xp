package com.enonic.lib.react4xp.ssr.pool;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import javax.script.ScriptEngine;
import javax.script.ScriptException;

import org.json.JSONArray;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.enonic.lib.react4xp.ssr.Config;
import com.enonic.lib.react4xp.ssr.RendererCache;
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

    private final RendererCache rendererCache;

    public Renderer( ScriptEngine scriptEngine, ResourceReader resourceReader, Config config, long id, RendererCache rendererCache) {
        this.rendererCache = rendererCache;
        this.id = id;

        // if (!IS_PRODMODE) {
        LOG.debug(this + ": starting init" + (config.LAZYLOAD ? " (lazyloading)" : "") + "...");
        // }

        this.config = config;
        this.engine = scriptEngine;

        try {
            List<String> dependencies = new ChunkDependencyParser( resourceReader, id ).getScriptDependencyNames( config );

			assetLoader = new AssetLoader( resourceReader, config.SCRIPTS_HOME, id, engine );

            assetLoader.loadAssetsIntoEngine(dependencies);

            // if (!IS_PRODMODE) {
            LOG.debug(this + ": init is done.");
            // }

        } catch (Exception e) {
            throw new RenderException(e, "Couldn't init " + this);
        }
    }

    private List<String> getRunnableAssetNames(String entryName, String dependencyNames) {
        List<String> runnableAssets = new ArrayList<>();

        if (dependencyNames != null && !"".equals(dependencyNames.trim())) {
            JSONArray array = new JSONArray(dependencyNames);
			for ( final Object o : array )
			{
				String assetName = (String) o;
				if ( assetName.endsWith( ".js" ) )
				{
					runnableAssets.add( assetName );
				}
			}
        }
		// Entries now has hash in the filename "entryname[hash].js", so this file no longer exist...
		// But is not needed either because the "entryname[hash].js" is loaded as a dependency.
        //String fullEntryName = entryName + ".js";
        //runnableAssets.add(fullEntryName);

        return runnableAssets;
    }

    ///////////////////////////////////////////////////////////////////////////////

    public static String evalAndGetByKey( ScriptEngine engine, String runnableCode, String key) throws RenderException {
        StringBuilder scriptBuilder = new StringBuilder(
                "var __react4xp__internal__nashorn__obj__ = {};" +
                "try {\n"
        );
            if (key != null) {
                scriptBuilder.append( "__react4xp__internal__nashorn__obj__." ).append( key ).append( "=" );
            }
            scriptBuilder.append(runnableCode);
        scriptBuilder.append("\n}catch (__react4xp__internal__nashorn_error__){");
            scriptBuilder.append("__react4xp__internal__nashorn__obj__.");
            scriptBuilder.append(KEY_STACKTRACE);
            scriptBuilder.append("=''+__react4xp__internal__nashorn_error__.stack;");
            scriptBuilder.append("__react4xp__internal__nashorn__obj__.");
            scriptBuilder.append(KEY_ERROR);
            scriptBuilder.append("=__react4xp__internal__nashorn_error__.message;");
        scriptBuilder.append("}");
        scriptBuilder.append("__react4xp__internal__nashorn__obj__;");

        String callScript = scriptBuilder.toString();

        try {
            Map __react4xp__internal__nashorn__obj__;
            final ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
            Thread.currentThread().setContextClassLoader( engine.getClass().getClassLoader() );
            try
            {
                __react4xp__internal__nashorn__obj__ = (Map) engine.eval( callScript);
            }
            finally
            {
                Thread.currentThread().setContextClassLoader( classLoader );
            }

            String errorMessage = (String) __react4xp__internal__nashorn__obj__.get(KEY_ERROR);

            if (errorMessage != null && !errorMessage.isBlank()) {
                String errorStack = (String) __react4xp__internal__nashorn__obj__.get(KEY_STACKTRACE);
                // LOG.warn(errorStack);
                // LOG.warn("The above is a nashorn-internal stack trace for the following error:");
                throw new RenderException(errorMessage, errorStack);
            }

            return (key != null)
                    ? (String) __react4xp__internal__nashorn__obj__.get(key)
                    : null;

        } catch (ScriptException s) {
            throw new RenderException(s);
        }
    }


    private Map<String, String> runSSR(String entry, String props, List<String> assetsInvolved) {
        final String cashKey = generateCacheKey( entry, props );
        if ( rendererCache.hasKey( cashKey ) )
        {
            return rendererCache.get( cashKey );
        }

        String call = "ReactDOMServer.renderToString(" + config.LIBRARY_NAME + "['" + entry + "'].default(" + props  + "));";

        try {
            String rendered = evalAndGetByKey( engine, call, KEY_HTML );
            Map<String, String> resultAsMap = Map.of( KEY_HTML, rendered );
            rendererCache.put( cashKey, resultAsMap );
            return resultAsMap;
        } catch (RenderException e) {
            ErrorHandler errorHandler = new ErrorHandler();
            String cleanErrorMessage = errorHandler.getCleanErrorMessage(e);
            LOG.error(
                    (e.getStacktraceString() == null ? "" : e.getStacktraceString() + "\n") +
                            errorHandler.getLoggableStackTrace(e, cleanErrorMessage) + "\n\n" +
                            e.getClass().getSimpleName() + ": " + cleanErrorMessage + "\n" +
                            "in " + ServerSideRenderer.class.getName() + ".runSSR\n" +
                            "Entry: '" + entry + "'\n" +
                            "Assets involved:\n\t" + String.join("\n\t", assetsInvolved) + "\n" +
                            "Failing call: '" + call + "'\n" +
                            errorHandler.getSolutionTips());

            return Map.of( KEY_ERROR, cleanErrorMessage );
        }
    }

    /**
     * Renders an entry to an HTML string.
     * @param entryName name of a transpiled JSX component, i.e. jsxPath: the filextension-less path to the compiled entry asset under assets/react4xp/, e.g: "site/parts/simple-reactive/simple-reactive"
     * @param props valid stringified JSON object: the entry's react props, e.g. '{"insertedMessage": "this is a prop!"}'
     * @param dependencyNames valid stringified JSON array: a set of file names to load into the engine (if not already done during initialization), needed by the entry before running it
     * @return {Map} Under the key 'html' (KEY_HTML), naked rendered HTML if successful. Under the key 'error' (KEY_ERROR), error message if failed.
     */
    public Map<String, String> render(String entryName, String props, String dependencyNames) {
        try {

            List<String> runnableAssetNames = getRunnableAssetNames(entryName, dependencyNames);
			LOG.debug(this + ": runnableAssetNames '" + runnableAssetNames + "'");

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

    private String generateCacheKey( final String entry, final String props )
    {
        return "hash@" + Objects.hash( entry, props );
    }

    /////////////////////////////////////////////////////////////////////////////// Identity

    public String toString() {
        return Renderer.class.getSimpleName() + "#" + id;
    }

}
