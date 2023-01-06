package com.enonic.lib.react4xp.html;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.parser.Parser;
import org.jsoup.select.Elements;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


public final class HtmlInserter
{
    private final static Logger LOG = LoggerFactory.getLogger( HtmlInserter.class );

    public String insertAtEndOfRoot( String body, String payload )
    {
        try
        {
            final Document bodyDoc = Jsoup.parse( body, "", Parser.xmlParser() );
            final Element lastElementChild = bodyDoc.lastElementChild();
            if ( lastElementChild == null )
            {
                throw new IllegalArgumentException("body has no root element");
            }
            lastElementChild.append( payload );
            return bodyDoc.html();
        }
        catch ( Exception e )
        {
            LOG.error( "\n\n" + "ERROR: [ " + e.getClass().getName() + " ] ...when trying to insert HTML" +
                           ( payload.length() < 1000 ? "...\n\n" + payload + "\n\n..." : " " ) + "into end of body" +
                           ( body.length() < 1000 ? ":\n\n" + body + "\n\n" : "" ) + "\nReturning the submitted body unchanged.", e );
        }
        return body;
    }

    public String insertInsideContainer(String body, String payload, String id, boolean appendErrorContainer) {
        try {
            final Document bodyDoc = Jsoup.parse( body, "", Parser.xmlParser() );
            final Elements select = bodyDoc.select( "#" + id );

            Element target = select.first();

            if ( target == null )
            {
                throw new IllegalArgumentException( "ID '" + id + "' not found." );
            }

            if ( appendErrorContainer )
            {
                final Element existingTarget = target.clone();
                target.attr( "id", id + "__error__" );
                target.attr( "style", "border:1px solid #8B0000; padding:15px; background-color:#FFB6C1" );
                target.html( payload );
                target.appendChild( existingTarget );
            }
            else
            {
                target.html( payload );
            }

            return bodyDoc.html();

        }
        catch ( Exception e )
        {
            LOG.error( "\n\n" + "ERROR: [ " + e.getClass().getName() + " ] ...when trying to " +
                           ( appendErrorContainer ? "append error message" : "insert" ) + " HTML" +
                           ( payload.length() < 10000 ? "...\n\n" + payload + "\n\n..." : " " ) + "at element with ID '" + id +
                           "' into body" + ( body.length() < 10000 ? ":\n\n" + body + "\n\n" : "" ) +
                           "\nReturning the submitted body unchanged.", e );
        }
        return body;
    }
}
