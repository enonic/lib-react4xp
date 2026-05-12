package com.enonic.lib.react4xp.ssr.resources;

import java.io.IOException;
import java.io.UncheckedIOException;

import org.graalvm.polyglot.Context;
import org.graalvm.polyglot.HostAccess;
import org.graalvm.polyglot.Source;
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
        final Context context = Context.newBuilder( "js" ).allowExperimentalOptions( true ).allowHostAccess( HostAccess.NONE ).build();

        new AssetLoader( _ -> "'use strict';" +
            "var a = '1'", "scriptsHome", 0, context, freshSource() ).loadAssetIntoEngine( "assetA", true );
        new AssetLoader( _ -> "globalThis.b = '2'", "scriptsHome", 0, context, freshSource() ).loadAssetIntoEngine( "assetC", true );
        assertEquals( "1", context.getBindings( "js" ).getMember( "a" ).asString() );
        assertEquals( "2", context.getBindings( "js" ).getMember( "b" ).asString() );
    }

    @Test
    void useStrict()
    {
        final Context context = Context.newBuilder( "js" ).allowExperimentalOptions( true ).allowHostAccess( HostAccess.NONE ).build();

        final AssetLoader assetLoader = new AssetLoader( _ -> "'use strict';" + "a = '1'", "scriptsHome", 0, context, freshSource() );
        assertThrows( RenderException.class, () -> assetLoader.loadAssetIntoEngine( "assetA", true ));
    }

    private static SourceProvider freshSource() {
        return ( name, content ) -> {
            try
            {
                return Source.newBuilder( "js", content, name ).build();
            }
            catch ( IOException e )
            {
                throw new UncheckedIOException( e );
            }
        };
    }

    static boolean graalJsExists() {
        try ( Context _ = Context.create( "js" ) )
        {
            return true;
        }
        catch ( Exception e )
        {
            return false;
        }
    }
}
