package com.enonic.lib.react4xp.ssr.engineFactory;

import javax.script.ScriptEngine;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.enonic.lib.react4xp.ssr.errors.RenderException;
import com.enonic.lib.react4xp.ssr.resources.AssetLoader;
import com.enonic.lib.react4xp.ssr.resources.ResourceReader;

public class EngineFactory
{
    private final static Logger LOG = LoggerFactory.getLogger( EngineFactory.class );

    private final EngineBuilder engineBuilder;

    private final ResourceReader resourceReader;

    private final static String POLYFILL_BASICS_FILE = "/lib/enonic/polyfill-react4xp/polyfillBasics.js";

    private final static String POLYFILL_REACT4XP_NASHORN_FILE = "/lib/enonic/polyfill-react4xp/nashornPolyfills.js";

    private final static String POLYFILL_REACT4XP_NODE_FILE = "/lib/enonic/polyfill-react4xp/nodePolyfills.js";

    private final static String POLYFILL_REACT4XP_USER_ADDED_FILE = "/lib/enonic/react4xp/nashornPolyfills.userAdded.js";

    /////////////////////////////////////////////////////////// INIT

    public EngineFactory( String engineName, String[] scriptEngineSettings, ResourceReader resourceReader )
    {
        engineBuilder = getEngineBuilder( engineName, scriptEngineSettings );
        this.resourceReader = resourceReader;
    }

    private EngineBuilder getEngineBuilder( String engineName, String[] scriptEngineSettings )
    {
        if ( "Nashorn".equalsIgnoreCase( engineName ) || ( engineName == null && EngineBuilderPlatform.preferredEngineName().equals( "Nashorn" ) ) )
        {
            return new EngineBuilderNashorn( scriptEngineSettings );
        }
        else
        {
            return new EngineBuilderPlatform( engineName );
        }
    }

    ////////////////////////////////////////////////////////////////////////////////////// ENTRY

    /**
     * MAIN ENTRY.
     * CHUNK_SOURCEFILES is a list of files (filename only, expected to be found in CHUNKFILES_HOME alongside the entries file)
     * that each describe one or several bundle/chunk asset file names, used to generate
     * a full list of dependency files, since the file names are hashed by webpack.
     * Sequence matters! These engine initialization scripts are run in this order.
     * Scripts found in chunks.json depend on the previous and must be the last!
     * nashornPolyfills.js script is the basic dependency, and will be added at the very beginning
     * outside of this list.
     */
    public ScriptEngine buildEngine( long id )
        throws RenderException
    {
        final ScriptEngine engine = engineBuilder.buildEngine();

        final AssetLoader assetLoader = new AssetLoader( resourceReader, null, id, engine );
        assetLoader.loadAssetIntoEngine( POLYFILL_BASICS_FILE, true );
        if ( engine.getFactory().getEngineName().contains( "Nashorn" ) )
        {
            assetLoader.loadAssetIntoEngine( POLYFILL_REACT4XP_NASHORN_FILE, true );
        }
        assetLoader.loadAssetIntoEngine( POLYFILL_REACT4XP_NODE_FILE, true );
        assetLoader.loadAssetIntoEngine( POLYFILL_REACT4XP_USER_ADDED_FILE, false );

        return engine;
    }
}
