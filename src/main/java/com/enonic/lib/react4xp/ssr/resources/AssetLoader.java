package com.enonic.lib.react4xp.ssr.resources;

import com.enonic.lib.react4xp.ssr.Config;
import com.enonic.lib.react4xp.ssr.ServerSideRenderer;
import com.enonic.lib.react4xp.ssr.errors.ErrorHandler;
import com.enonic.lib.react4xp.ssr.errors.RenderException;
import com.enonic.lib.react4xp.ssr.pool.Renderer;
import com.enonic.xp.server.RunMode;
import jdk.nashorn.api.scripting.NashornScriptEngine;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;


public class AssetLoader {
    private final static Logger LOG = LoggerFactory.getLogger( AssetLoader.class );

    public static final boolean IS_PRODMODE = (RunMode.get() == RunMode.PROD);
    private final HashMap<String, Boolean> ASSET_LOADED_MARKERS = new HashMap<>();


    private final long id;
    private final ResourceReader resourceReader;
    private final Config config;

    public AssetLoader(ResourceReader resourceReader, Config config, long id) {
        this.id = id;
        this.resourceReader = resourceReader;
        this.config = config;
    }

    public void loadAssetsIntoEngine(LinkedList<String> runnableAssets, NashornScriptEngine engine) {
        ensureMarkers(runnableAssets);
        for (String assetName : runnableAssets) {
            if (shouldLoadAsset(assetName)) {
                loadAssetIntoEngine(assetName, engine);
            }
        }
    }




    private void ensureMarkers(List<String> assetNames) {
        if (!IS_PRODMODE) {
            return;
        }
        for (String assetName : assetNames) {
            if (!ASSET_LOADED_MARKERS.containsKey(assetName)) {
                ASSET_LOADED_MARKERS.put(assetName, false);
            }
        }
    }

    private boolean shouldLoadAsset(String assetName) {
        return (!IS_PRODMODE || !ASSET_LOADED_MARKERS.get(assetName));
    }

    private void markAssetLoaded(String assetName) {
        if (IS_PRODMODE) {
            ASSET_LOADED_MARKERS.put(assetName, true);
        }
    }


    /** Load both entry assets and JS dependency chunks into the Nashorn engine */
    private void loadAssetIntoEngine(String assetName, NashornScriptEngine engine) {

        // if (!IS_PRODMODE) {
        LOG.info(this + ": loading asset '" + assetName + "'");
        // }

        try {
            String content = resourceReader.readResource(config.SCRIPTS_HOME + "/" + assetName);
            Renderer.evalAndGetByKey(engine, content, null);

            // if (!IS_PRODMODE) {
            LOG.info(this + ": successfully loaded '" + assetName + "'");
            // }

            markAssetLoaded(assetName);

        } catch (IOException e1) {
            throw new RenderException(e1);

        } catch (RenderException e2) {
            ErrorHandler errorHandler = new ErrorHandler();
            LOG.error(
                    (e2.getStacktraceString() == null ? "" : e2.getStacktraceString() + "\n") +
                            errorHandler.getLoggableStackTrace(e2, e2.getMessage()) + "\n\n" +
                            e2.getClass().getSimpleName() + ": " + e2.getMessage() + "\n" +
                            "in " + ServerSideRenderer.class.getName() + ".loadAsset\n" +
                            "assetName = '" +assetName + "'\n" +
                            errorHandler.getSolutionTips());

            throw e2;
        }
    }



    public String toString() {
        return AssetLoader.class.getSimpleName() + "#" + id;
    }
}
