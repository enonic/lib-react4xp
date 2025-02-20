package com.enonic.lib.react4xp.html;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class HtmlInserterTest
{

    @Test
    void insertAtEndOfRoot()
    {
        assertEquals( "<html><head><link bla=\"\"/></head><div><div></div></div><a>text</a></html>",
                      new HtmlInserter().insertAtEndOfRoot( "<html><head><link bla=\"\"/></head><div><div></div></div></html>",
                                                            "<a>text</a>" ) );
    }

    @Test
    void insertAtEndOfRoot_html()
    {
        assertEquals( "<!DOCTYPE html><html><head><link rel=\"stylesheet\" href=\"styles.css\"></head><div><div></div></div>text</html>",
                      new HtmlInserter().insertAtEndOfRoot(
                          "<!DOCTYPE html><html><head><link rel=\"stylesheet\" href=\"styles.css\"></head><div><div></div></div></html>",
                          "text" ) );
    }

    @Test
    void insertInsideContainer()
    {
        assertEquals( "<div><div id=\"1\"><a>text</a></div></div>",
                      new HtmlInserter().insertInsideContainer( "<div><div id=\"1\"><div></div></div></div>", "<a>text</a>", "1", false ) );
    }

    @Test
    void insertInsideSelfClosedContainer()
    {
        assertEquals( "<div id=\"1\"><a>text</a></div>",
                      new HtmlInserter().insertInsideContainer( "<div id=\"1\"/>", "<a>text</a>", "1", false ) );
    }

    @Test
    void insertInsideContainer_multiple_elements()
    {
        assertEquals( "<div id=\"1\"><a>text</a></div><div id=\"2\"></div>",
                      new HtmlInserter().insertInsideContainer( "<div id=\"1\"></div><div id=\"2\"></div>", "<a>text</a>", "1", false ) );
    }

    @Test
    void insertInsideContainer_appendError()
    {
        assertEquals(
            "<main id=\"1__error__\" style=\"border:1px solid #8B0000; padding:15px; background-color:#FFB6C1\"><a>text</a><main id=\"1\"><p></p></main></main>",
            new HtmlInserter().insertInsideContainer( "<main id=\"1\"><p></p></main>", "<a>text</a>", "1", true ) );
    }

    @Test
    void insertInsideSelfClosedContainer_appendError()
    {
        assertEquals(
            "<main id=\"1__error__\" style=\"border:1px solid #8B0000; padding:15px; background-color:#FFB6C1\"><a>text</a><main id=\"1\"/></main>",
            new HtmlInserter().insertInsideContainer( "<main id=\"1\"/>", "<a>text</a>", "1", true ) );
    }

    @Test
    void insertInsideContainer_html()
    {
        assertEquals( "<!DOCTYPE html><html><head><link rel=\"stylesheet\" href=\"styles.css\"></head><body id=\"1\">text</body></html>",
                      new HtmlInserter().insertInsideContainer(
                          "<!DOCTYPE html><html><head><link rel=\"stylesheet\" href=\"styles.css\"></head><body id=\"1\"></body></html>",
                          "text", "1", false ) );
    }
}
