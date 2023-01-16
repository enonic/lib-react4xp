package com.enonic.lib.react4xp.html;

import java.io.StringReader;
import java.io.StringWriter;
import java.util.LinkedHashMap;
import java.util.Map;

import org.attoparser.IMarkupHandler;
import org.attoparser.IMarkupParser;
import org.attoparser.MarkupParser;
import org.attoparser.ParseException;
import org.attoparser.config.ParseConfiguration;
import org.attoparser.discard.DiscardMarkupHandler;
import org.attoparser.output.OutputMarkupHandler;
import org.attoparser.select.BlockSelectorMarkupHandler;
import org.attoparser.select.NodeSelectorMarkupHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


public final class HtmlInserter
{
    private final static Logger LOG = LoggerFactory.getLogger( HtmlInserter.class );

    private final IMarkupParser parser = new MarkupParser( ParseConfiguration.htmlConfiguration() );

    public String insertAtEndOfRoot( String body, String payload )
    {
        try
        {
            final StringWriter outputWriter = new StringWriter();
            final OutputMarkupHandler outputHandler = new OutputMarkupHandler( outputWriter );

            final IMarkupHandler handler =
                new NodeSelectorMarkupHandler( new AppendMarkupHandler( outputWriter, outputHandler, payload ), outputHandler, "/[0]" );
            parser.parse( new StringReader( body ), handler );
            return outputWriter.toString();

        }
        catch ( Exception e )
        {
            LOG.error( "\n\n" + "ERROR: [ " + e.getClass().getName() + " ] ...when trying to insert HTML" +
                           ( payload.length() < 1000 ? "...\n\n" + payload + "\n\n..." : " " ) + "into end of body" +
                           ( body.length() < 1000 ? ":\n\n" + body + "\n\n" : "" ) + "\nReturning the submitted body unchanged.", e );
        }
        return body;
    }

    public String insertInsideContainer( String body, String payload, String id, boolean appendErrorContainer )
    {
        try
        {
            final StringWriter outputWriter = new StringWriter();
            final OutputMarkupHandler outputHandler = new OutputMarkupHandler( outputWriter );

            final IMarkupHandler handler;
            if ( appendErrorContainer )
            {
                handler = new NodeSelectorMarkupHandler(
                    new ErrorMarkupHandler( outputWriter, outputHandler, payload, Map.entry( "id", id + "__error__" ),
                                            Map.entry( "style", "border:1px solid #8B0000; padding:15px; background-color:#FFB6C1" ) ),
                    outputHandler, "[id='" + id + "']" );
            }
            else
            {
                handler = new BlockSelectorMarkupHandler( new ReplaceContentHandler( outputWriter, outputHandler, payload ), outputHandler,
                                                          "[id='" + id + "']" );
            }
            parser.parse( new StringReader( body ), handler );
            return outputWriter.toString();
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

    private static class ReplaceContentHandler
        extends DynamicDelegateMarkupHandler
    {
        private int inTag;

        private final OutputMarkupHandler outputHandler;

        private final StringWriter outputWriter;

        private final String payload;

        private static final IMarkupHandler DISCARD_MARKUP_HANDLER = new DiscardMarkupHandler();

        public ReplaceContentHandler( final StringWriter outputWriter, final OutputMarkupHandler outputHandler, final String payload )
        {
            this.outputWriter = outputWriter;
            this.outputHandler = outputHandler;
            this.payload = payload;
            this.currentOutputHandler = this.outputHandler;
        }

        public void handleOpenElementEnd( final char[] buffer, final int offset, final int len, final int line, final int col )
            throws ParseException
        {
            currentOutputHandler.handleOpenElementEnd( buffer, offset, len, line, col );
            if ( inTag == 0 )
            {
                outputWriter.write( payload );
                currentOutputHandler = DISCARD_MARKUP_HANDLER;
            }
            inTag++;
        }

        public void handleCloseElementStart( final char[] buffer, final int offset, final int len, final int line, final int col )
            throws ParseException
        {
            inTag--;
            if ( inTag == 0 )
            {
                currentOutputHandler = outputHandler;
            }
            currentOutputHandler.handleCloseElementStart( buffer, offset, len, line, col );
        }

        @Override
        public void handleStandaloneElementEnd( final char[] buffer, final int nameOffset, final int nameLen, final boolean minimized,
                                                final int line, final int col )
            throws ParseException
        {
            if ( inTag == 0 )
            {
                outputWriter.write( ">" );
                outputWriter.write( payload );
                outputWriter.write( "</" );
                outputWriter.write( buffer, nameOffset, nameLen );
                outputWriter.write( ">" );
            }
            else
            {
                currentOutputHandler.handleStandaloneElementEnd( buffer, nameOffset, nameLen, minimized, line, col );
            }
        }
    }

    private static class AppendMarkupHandler
        extends DynamicDelegateMarkupHandler
    {
        private final StringWriter outputWriter;

        private final String payload;

        public AppendMarkupHandler( final StringWriter outputWriter, final OutputMarkupHandler outputHandler, final String payload )
        {
            this.outputWriter = outputWriter;
            this.payload = payload;
            this.currentOutputHandler = outputHandler;
        }

        public void handleOpenElementEnd( final char[] buffer, final int offset, final int len, final int line, final int col )
            throws ParseException
        {
            currentOutputHandler.handleOpenElementEnd( buffer, offset, len, line, col );
        }

        public void handleCloseElementStart( final char[] buffer, final int offset, final int len, final int line, final int col )
            throws ParseException
        {
            outputWriter.write( payload );
            currentOutputHandler.handleCloseElementStart( buffer, offset, len, line, col );
        }

        @Override
        public void handleStandaloneElementEnd( final char[] buffer, final int nameOffset, final int nameLen, final boolean minimized,
                                                final int line, final int col )
        {
            outputWriter.write( ">" );
            outputWriter.write( payload );
            outputWriter.write( "</" );
            outputWriter.write( buffer, nameOffset, nameLen );
            outputWriter.write( ">" );
        }

        @Override
        public void handleAttribute( final char[] buffer, final int nameOffset, final int nameLen, final int nameLine, final int nameCol,
                                     final int operatorOffset, final int operatorLen, final int operatorLine, final int operatorCol,
                                     final int valueContentOffset, final int valueContentLen, final int valueOuterOffset,
                                     final int valueOuterLen, final int valueLine, final int valueCol )
            throws ParseException
        {
            currentOutputHandler.handleAttribute( buffer, nameOffset, nameLen, nameLine, nameCol, operatorOffset, operatorLen, operatorLine,
                                                  operatorCol, valueContentOffset, valueContentLen, valueOuterOffset, valueOuterLen,
                                                  valueLine, valueCol );
        }
    }

    private static class ErrorMarkupHandler
        extends DynamicDelegateMarkupHandler
    {
        private final StringWriter outputWriter;

        private final String payload;

        private final Map<String, String> attrs;

        @SafeVarargs
        public ErrorMarkupHandler( final StringWriter outputWriter, final OutputMarkupHandler outputHandler, final String payload,
                                   Map.Entry<String, String>... attrs )
        {
            this.outputWriter = outputWriter;
            this.payload = payload;
            this.currentOutputHandler = outputHandler;
            this.attrs = new LinkedHashMap<>( attrs.length );
            for ( Map.Entry<String, String> attr : attrs )
            {
                this.attrs.put( attr.getKey(), attr.getValue() );
            }
        }

        @Override
        public void handleOpenElementStart( final char[] buffer, final int nameOffset, final int nameLen, final int line, final int col )
            throws ParseException
        {
            writeOpenTag( buffer, nameOffset, nameLen );
            currentOutputHandler.handleOpenElementStart( buffer, nameOffset, nameLen, line, col );
        }

        @Override
        public void handleCloseElementEnd( final char[] buffer, final int nameOffset, final int nameLen, final int line, final int col )
            throws ParseException
        {
            currentOutputHandler.handleCloseElementEnd( buffer, nameOffset, nameLen, line, col );
            writeCloseTag( buffer, nameOffset, nameLen );
        }

        @Override
        public void handleStandaloneElementStart( final char[] buffer, final int nameOffset, final int nameLen, final boolean minimized,
                                                  final int line, final int col )
            throws ParseException
        {
            writeOpenTag( buffer, nameOffset, nameLen );
            currentOutputHandler.handleStandaloneElementStart( buffer, nameOffset, nameLen, minimized, line, col );
        }

        @Override
        public void handleStandaloneElementEnd( final char[] buffer, final int nameOffset, final int nameLen, final boolean minimized,
                                                final int line, final int col )
            throws ParseException
        {
            currentOutputHandler.handleStandaloneElementEnd( buffer, nameOffset, nameLen, minimized, line, col );
            writeCloseTag( buffer, nameOffset, nameLen );
        }

        private void writeOpenTag( final char[] buffer, final int nameOffset, final int nameLen )
        {
            outputWriter.write( "<" );
            outputWriter.write( buffer, nameOffset, nameLen );
            for ( Map.Entry<String, String> attr : attrs.entrySet() )
            {
                outputWriter.write( " " );
                outputWriter.write( attr.getKey() );
                outputWriter.write( "=" );
                outputWriter.write( "\"" );
                outputWriter.write( attr.getValue() );
                outputWriter.write( "\"" );
            }
            outputWriter.write( ">" );
            outputWriter.write( payload );
        }
        private void writeCloseTag( final char[] buffer, final int nameOffset, final int nameLen )
        {
            outputWriter.write( "</" );
            outputWriter.write( buffer, nameOffset, nameLen );
            outputWriter.write( ">" );
        }
    }
}
