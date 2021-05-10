package com.enonic.lib.react4xp.ssr.resources;

import com.enonic.lib.react4xp.ssr.Config;
import com.enonic.lib.react4xp.ssr.ServerSideRenderer;
import com.enonic.lib.react4xp.ssr.errors.ErrorHandler;
import com.enonic.lib.react4xp.ssr.errors.RenderException;
import com.enonic.xp.resource.Resource;
import com.enonic.xp.resource.ResourceKey;
import com.enonic.xp.resource.ResourceService;
import com.enonic.xp.server.RunMode;
import jdk.nashorn.api.scripting.NashornScriptEngine;
import org.apache.commons.io.Charsets;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.script.ScriptException;
import java.io.IOException;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.function.Supplier;


public class AssetLoader {
    private final static Logger LOG = LoggerFactory.getLogger( AssetLoader.class );

    public static final boolean IS_PRODMODE = (RunMode.get() == RunMode.PROD);
    private final HashMap<String, Boolean> ASSET_LOADED_MARKERS = new HashMap<>();



    private final Supplier<ResourceService> resourceServiceSupplier;
    private final Config config;

    public AssetLoader(Supplier<ResourceService> resourceServiceSupplier, Config config) {
        this.resourceServiceSupplier = resourceServiceSupplier;
        this.config = config;
    }

    public void loadAssets(LinkedList<String> runnableAssets, NashornScriptEngine engine) {
        ensureMarkers(runnableAssets);
        for (String assetName : runnableAssets) {
            if (shouldLoadAsset(assetName)) {
                loadAsset(assetName, engine);
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
    private void loadAsset(String assetName, NashornScriptEngine engine) {
                                                                                                                        //if (!IS_PRODMODE) {
                                                                                                                            LOG.info(this + " - initializing asset: " + assetName);
                                                                                                                        //}
        String assetContent = null;
        String url = null;

        try {
            url = config.APP_NAME + ":" + config.SCRIPTS_HOME + "/" + assetName;

            // TODO: DRY
            ResourceKey resourceKey = ResourceKey.from(url);
            Resource resource = resourceServiceSupplier.get().getResource(resourceKey);
            assetContent = resource.getBytes().asCharSource(Charsets.UTF_8).read();

            //processedCode += assetCode + "\n";

            engine.eval(assetContent);

            markAssetLoaded(assetName);

        } catch (IOException e1) {
            ErrorHandler errorHandler = new ErrorHandler();
            LOG.error(
                    errorHandler.getLoggableStackTrace(e1, null) + "\n\n" +
                            e1.getClass().getSimpleName()  + ": " + e1.getMessage() + "\n" +
                            "in " + ServerSideRenderer.class.getName() + ".loadAsset\n" +
                            "assetName = '" + assetName + "'\n" +
                            "resource url = '" + url + "'\n" +
                            errorHandler.getSolutionTips());

            throw new RenderException(e1);

        } catch (ScriptException e2) {
            ErrorHandler errorHandler = new ErrorHandler();
            String cleanErrorMessage = errorHandler.getCleanErrorMessage(e2);
            LOG.error(
                    errorHandler.getLoggableStackTrace(e2, cleanErrorMessage) + "\n\n" +
                            e2.getClass().getSimpleName() + ": " + cleanErrorMessage + "\n" +
                            "in " + ServerSideRenderer.class.getName() + ".loadAsset\n" +
                            "assetName = '" +assetName + "'\n" +
                            "resource url = '" + url + "'\n" +
                            errorHandler.getSolutionTips());

            throw new RenderException(e2, cleanErrorMessage);
        }
    }



                                                                                                                        private final int ID = (int)Math.floor(Math.random() * 10000);
                                                                                                                        public String toString() {
                                                                                                                            return AssetLoader.class.getSimpleName() + "#" + ID;
                                                                                                                        }
}
