package com.enonic.lib.react4xp.ssr.resources;

import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIf;

import com.enonic.lib.react4xp.ssr.errors.RenderException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

@EnabledIf("graalJsExists")
class AssetLoaderTest
{
    @Test
    void loadAssetIntoEngine()
    {
        final ScriptEngineManager scriptEngineManager = new ScriptEngineManager();
        ScriptEngine engine = scriptEngineManager.getEngineByName( "GraalJS" );

        new AssetLoader( resourcePath -> "'use strict';" +
            "var a = '1'", "scriptsHome", 0, engine ).loadAssetIntoEngine( "assetA", true );
        new AssetLoader( resourcePath -> "globalThis.b = '2'", "scriptsHome", 0, engine ).loadAssetIntoEngine( "assetC", true );
        assertEquals( "1", engine.get( "a" ) );
        assertEquals( "2", engine.get( "b" ) );
    }

    @Test
    void useStrict()
    {
        final ScriptEngineManager scriptEngineManager = new ScriptEngineManager();
        ScriptEngine engine = scriptEngineManager.getEngineByName( "GraalJS" );

        final AssetLoader assetLoader = new AssetLoader( resourcePath -> "'use strict';" + "a = '1'", "scriptsHome", 0, engine );
        assertThrows( RenderException.class, () -> assetLoader.loadAssetIntoEngine( "assetA", true ));
    }

    static boolean graalJsExists() {
        return new ScriptEngineManager().getEngineByName( "GraalJS" ) != null;
    }
}
