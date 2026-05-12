package com.enonic.lib.react4xp.ssr.renderer;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

import org.graalvm.polyglot.Context;
import org.graalvm.polyglot.Engine;
import org.graalvm.polyglot.Source;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIf;

import com.enonic.lib.react4xp.ssr.Config;
import com.enonic.lib.react4xp.ssr.engine.EngineFactory;
import com.enonic.lib.react4xp.ssr.resources.ResourceReader;
import com.enonic.lib.react4xp.ssr.resources.SourceProvider;

import static com.enonic.lib.react4xp.ssr.errors.ErrorHandler.KEY_ERROR;
import static com.enonic.lib.react4xp.ssr.renderer.Renderer.KEY_HTML;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@EnabledIf("graalJsExists")
class RendererTest
{
    private static final String POLYFILL_BASICS = "/lib/enonic/polyfill-react4xp/polyfillBasics.js";

    private static final String POLYFILL_NODE = "/lib/enonic/polyfill-react4xp/nodePolyfills.js";

    private static final String CHUNKS_GLOBALS_JSON = "/react4xp/chunks.globals.json";

    private static final String GLOBALS_JS = "/react4xp/globals.js";

    private Engine engine;

    @BeforeEach
    void setUp()
    {
        engine = EngineFactory.buildSharedEngine();
    }

    @AfterEach
    void tearDown()
    {
        engine.close();
    }

    @Test
    void render_produces_html_from_react_like_entry()
    {
        final Map<String, String> fixtures = baseFixtures();
        fixtures.put( CHUNKS_GLOBALS_JSON, "{ \"main\": { \"js\": \"globals.js\" } }" );
        fixtures.put( GLOBALS_JS,
            // Entry's default() returns a React-element-shaped tree, like a transpiled JSX component would.
            "globalThis.React4xp = {" +
                "  '_components/Greeter': {" +
                "    default: function(props) {" +
                "      return {" +
                "        type: 'section'," +
                "        props: {" +
                "          id: 'greeter'," +
                "          children: [" +
                "            { type: 'h1', props: { children: props.greeting + ', ' + props.name + '!' } }," +
                "            { type: 'p',  props: { children: 'Items: ' + props.items.length } }" +
                "          ]" +
                "        }" +
                "      };" +
                "    }" +
                "  }" +
                "};" +
                // Tiny stand-in for ReactDOMServer.renderToString. Uses identifierPrefix the way React does
                // (as a hydration-id prefix on rendered elements).
                "globalThis.ReactDOMServer = {" +
                "  renderToString: function(element, opts) {" +
                "    var prefix = (opts && opts.identifierPrefix) ? opts.identifierPrefix + '-' : '';" +
                "    function render(node) {" +
                "      if (node == null) return '';" +
                "      if (typeof node === 'string') return node;" +
                "      if (Array.isArray(node)) return node.map(render).join('');" +
                "      var attrs = node.props.id ? (' id=\"' + prefix + node.props.id + '\"') : '';" +
                "      return '<' + node.type + attrs + '>' + render(node.props.children) + '</' + node.type + '>';" +
                "    }" +
                "    return render(element);" +
                "  }" +
                "};" );

        final Renderer renderer = new Renderer( strictReader( fixtures ), testConfig(), 1L, engine, freshSource() );
        try
        {
            final Map<String, String> result = renderer.render( "_components/Greeter",
                                                                "{\"greeting\":\"Hello\",\"name\":\"World\",\"items\":[1,2,3]}",
                                                                new String[0] );

            assertEquals( "<section id=\"my-app-greeter\"><h1>Hello, World!</h1><p>Items: 3</p></section>", result.get( KEY_HTML ) );
            assertNull( result.get( KEY_ERROR ) );
        }
        finally
        {
            renderer.close();
        }
    }

    @Test
    void render_real_react_component_via_server_edge()
    {
        final String reactBundle = readClasspathResource( "/test-fixtures/react-bundle.js" );

        // Use the real production-compiled polyfills, so the React bundle finds globalThis.TextEncoder
        // (and the SSR timer no-ops) the same way it does in production.
        final Map<String, String> fixtures = new HashMap<>();
        fixtures.put( POLYFILL_BASICS, readClasspathResource( POLYFILL_BASICS ) );
        fixtures.put( POLYFILL_NODE, readClasspathResource( POLYFILL_NODE ) );
        fixtures.put( CHUNKS_GLOBALS_JSON, "{ \"main\": { \"js\": \"globals.js\" } }" );
        fixtures.put( GLOBALS_JS,
            reactBundle + "\n" + "globalThis.React4xp = {" + "  '_components/Greeter': {" + "    default: function(props) {" +
                "      return React.createElement('section', { id: 'greeter' }," +
                "        React.createElement('h1', null, 'Hello, ' + props.name + '!')," +
                "        React.createElement('p',  null, 'Items: ' + props.items.length)" + "      );" + "    }" + "  }" + "};" );

        final Renderer renderer = new Renderer( strictReader( fixtures ), testConfig(), 10L, engine, freshSource() );
        try
        {
            final Map<String, String> result = renderer.render( "_components/Greeter",
                                                                "{\"name\":\"World\",\"items\":[1,2,3]}",
                                                                new String[0] );

            assertNull( result.get( KEY_ERROR ), "expected success, got error: " + result.get( KEY_ERROR ) );
            final String html = result.get( KEY_HTML );
            assertTrue( html.contains( "<h1>Hello, World!</h1>" ), "got: " + html );
            assertTrue( html.contains( "<p>Items: 3</p>" ), "got: " + html );
            assertTrue( html.contains( "id=\"my-app-greeter\"" ) || html.contains( "id=\"greeter\"" ),
                        "expected an id on the section, got: " + html );
        }
        finally
        {
            renderer.close();
        }
    }

    @Test
    void render_real_react_component_via_server_browser_with_message_channel_shim()
    {
        // server.browser constructs `new MessageChannel()` at module-load time. This test
        // pins the contract that the transitional shim in nodePolyfills.ts lets the module
        // load and that renderToString (via server-legacy.browser) produces HTML.
        final String reactBundle = readClasspathResource( "/test-fixtures/react-bundle-server-browser.js" );

        final Map<String, String> fixtures = new HashMap<>();
        fixtures.put( POLYFILL_BASICS, readClasspathResource( POLYFILL_BASICS ) );
        fixtures.put( POLYFILL_NODE, readClasspathResource( POLYFILL_NODE ) );
        fixtures.put( CHUNKS_GLOBALS_JSON, "{ \"main\": { \"js\": \"globals.js\" } }" );
        fixtures.put( GLOBALS_JS,
                      reactBundle + "\n" + "globalThis.React4xp = {" + "  '_components/Greeter': {" + "    default: function(props) {" +
                          "      return React.createElement('h1', null, 'Hello, ' + props.name + '!');" + "    }" + "  }" + "};" );

        final Renderer renderer = new Renderer( strictReader( fixtures ), testConfig(), 11L, engine, freshSource() );
        try
        {
            final Map<String, String> result = renderer.render( "_components/Greeter", "{\"name\":\"World\"}", new String[0] );

            assertNull( result.get( KEY_ERROR ), "expected success, got error: " + result.get( KEY_ERROR ) );
            assertEquals( "<h1>Hello, World!</h1>", result.get( KEY_HTML ) );
        }
        finally
        {
            renderer.close();
        }
    }

    @Test
    void render_unknown_entry_propagates_illegal_state()
    {
        final Map<String, String> fixtures = baseFixtures();
        fixtures.put( CHUNKS_GLOBALS_JSON, "{ \"main\": { \"js\": \"globals.js\" } }" );
        fixtures.put( GLOBALS_JS,
            "globalThis.React4xp = {};" + "globalThis.ReactDOMServer = { renderToString: function() { return ''; } };" );

        final Renderer renderer = new Renderer( strictReader( fixtures ), testConfig(), 2L, engine, freshSource() );
        try
        {
            final IllegalStateException ex =
                assertThrows( IllegalStateException.class, () -> renderer.render( "missing", "{}", new String[0] ) );
            assertTrue( ex.getMessage().contains( "missing" ), "message should mention entry name, got: " + ex.getMessage() );
        }
        finally
        {
            renderer.close();
        }
    }

    private static String readClasspathResource( final String path )
    {
        try ( InputStream in = RendererTest.class.getResourceAsStream( path ) )
        {
            if ( in == null )
            {
                throw new IllegalStateException( "Resource not found on test classpath: " + path );
            }
            return new String( in.readAllBytes(), StandardCharsets.UTF_8 );
        }
        catch ( IOException e )
        {
            throw new UncheckedIOException( e );
        }
    }

    private static Map<String, String> baseFixtures()
    {
        final Map<String, String> fixtures = new HashMap<>();
        fixtures.put( POLYFILL_BASICS, "" );
        fixtures.put( POLYFILL_NODE, "" );
        return fixtures;
    }

    private static ResourceReader strictReader( final Map<String, String> fixtures )
    {
        return path -> {
            final String content = fixtures.get( path );
            if ( content == null )
            {
                throw new IllegalArgumentException( "No test fixture for resource: " + path );
            }
            return content;
        };
    }

    private static SourceProvider freshSource()
    {
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

    private static Config testConfig()
    {
        return new Config( "my-app", "/react4xp", "React4xp", "/react4xp/", "entries.json", "chunks.globals.json", "stats.components.json" );
    }

    static boolean graalJsExists()
    {
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
