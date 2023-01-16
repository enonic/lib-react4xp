package com.enonic.lib.react4xp.html;

import org.attoparser.AbstractMarkupHandler;
import org.attoparser.IMarkupHandler;
import org.attoparser.ParseException;

public class DynamicDelegateMarkupHandler extends AbstractMarkupHandler
{
    protected IMarkupHandler currentOutputHandler;

    @Override
    public void handleDocumentStart( final long startTimeNanos, final int line, final int col )
        throws ParseException
    {
        currentOutputHandler.handleDocumentStart( startTimeNanos, line, col );
    }

    @Override
    public void handleDocumentEnd( final long endTimeNanos, final long totalTimeNanos, final int line, final int col )
        throws ParseException
    {
        currentOutputHandler.handleDocumentEnd( endTimeNanos, totalTimeNanos, line, col );
    }

    @Override
    public void handleXmlDeclaration( final char[] buffer, final int keywordOffset, final int keywordLen, final int keywordLine,
                                      final int keywordCol, final int versionOffset, final int versionLen, final int versionLine,
                                      final int versionCol, final int encodingOffset, final int encodingLen, final int encodingLine,
                                      final int encodingCol, final int standaloneOffset, final int standaloneLen, final int standaloneLine,
                                      final int standaloneCol, final int outerOffset, final int outerLen, final int line, final int col )
        throws ParseException
    {
        currentOutputHandler.handleXmlDeclaration( buffer, keywordOffset, keywordLen, keywordLine, keywordCol, versionOffset, versionLen,
                                                   versionLine, versionCol, encodingOffset, encodingLen, encodingLine, encodingCol,
                                                   standaloneOffset, standaloneLen, standaloneLine, standaloneCol, outerOffset, outerLen,
                                                   line, col );
    }

    @Override
    public void handleDocType( final char[] buffer, final int keywordOffset, final int keywordLen, final int keywordLine,
                               final int keywordCol, final int elementNameOffset, final int elementNameLen, final int elementNameLine,
                               final int elementNameCol, final int typeOffset, final int typeLen, final int typeLine, final int typeCol,
                               final int publicIdOffset, final int publicIdLen, final int publicIdLine, final int publicIdCol,
                               final int systemIdOffset, final int systemIdLen, final int systemIdLine, final int systemIdCol,
                               final int internalSubsetOffset, final int internalSubsetLen, final int internalSubsetLine,
                               final int internalSubsetCol, final int outerOffset, final int outerLen, final int outerLine,
                               final int outerCol )
        throws ParseException
    {
        currentOutputHandler.handleDocType( buffer, keywordOffset, keywordLen, keywordLine, keywordCol, elementNameOffset, elementNameLen,
                                            elementNameLine, elementNameCol, typeOffset, typeLen, typeLine, typeCol, publicIdOffset,
                                            publicIdLen, publicIdLine, publicIdCol, systemIdOffset, systemIdLen, systemIdLine, systemIdCol,
                                            internalSubsetOffset, internalSubsetLen, internalSubsetLine, internalSubsetCol, outerOffset,
                                            outerLen, outerLine, outerCol );
    }

    @Override
    public void handleCDATASection( final char[] buffer, final int contentOffset, final int contentLen, final int outerOffset,
                                    final int outerLen, final int line, final int col )
        throws ParseException
    {
        currentOutputHandler.handleCDATASection( buffer, contentOffset, contentLen, outerOffset, outerLen, line, col );
    }

    @Override
    public void handleComment( final char[] buffer, final int contentOffset, final int contentLen, final int outerOffset,
                               final int outerLen, final int line, final int col )
        throws ParseException
    {
        currentOutputHandler.handleComment( buffer, contentOffset, contentLen, outerOffset, outerLen, line, col );
    }

    @Override
    public void handleText( final char[] buffer, final int offset, final int len, final int line, final int col )
        throws ParseException
    {
        currentOutputHandler.handleText( buffer, offset, len, line, col );
    }

    @Override
    public void handleStandaloneElementStart( final char[] buffer, final int nameOffset, final int nameLen, final boolean minimized,
                                              final int line, final int col )
        throws ParseException
    {
        currentOutputHandler.handleStandaloneElementStart( buffer, nameOffset, nameLen, minimized, line, col );
    }

    @Override
    public void handleStandaloneElementEnd( final char[] buffer, final int nameOffset, final int nameLen, final boolean minimized,
                                            final int line, final int col )
        throws ParseException
    {
        currentOutputHandler.handleStandaloneElementEnd( buffer, nameOffset, nameLen, minimized, line, col );
    }

    @Override
    public void handleOpenElementStart( final char[] buffer, final int nameOffset, final int nameLen, final int line, final int col )
        throws ParseException
    {
        currentOutputHandler.handleOpenElementStart( buffer, nameOffset, nameLen, line, col );
    }

    @Override
    public void handleOpenElementEnd( final char[] buffer, final int nameOffset, final int nameLen, final int line, final int col )
        throws ParseException
    {
        currentOutputHandler.handleOpenElementEnd( buffer, nameOffset, nameLen, line, col );
    }

    @Override
    public void handleAutoOpenElementStart( final char[] buffer, final int nameOffset, final int nameLen, final int line, final int col )
        throws ParseException
    {
        currentOutputHandler.handleAutoOpenElementStart( buffer, nameOffset, nameLen, line, col );
    }

    @Override
    public void handleAutoOpenElementEnd( final char[] buffer, final int nameOffset, final int nameLen, final int line, final int col )
        throws ParseException
    {
        currentOutputHandler.handleAutoOpenElementEnd( buffer, nameOffset, nameLen, line, col );
    }

    @Override
    public void handleCloseElementStart( final char[] buffer, final int nameOffset, final int nameLen, final int line, final int col )
        throws ParseException
    {
        currentOutputHandler.handleCloseElementStart( buffer, nameOffset, nameLen, line, col );
    }

    @Override
    public void handleCloseElementEnd( final char[] buffer, final int nameOffset, final int nameLen, final int line, final int col )
        throws ParseException
    {
        currentOutputHandler.handleCloseElementEnd( buffer, nameOffset, nameLen, line, col );
    }

    @Override
    public void handleAutoCloseElementStart( final char[] buffer, final int nameOffset, final int nameLen, final int line, final int col )
        throws ParseException
    {
        currentOutputHandler.handleAutoCloseElementStart( buffer, nameOffset, nameLen, line, col );
    }

    @Override
    public void handleAutoCloseElementEnd( final char[] buffer, final int nameOffset, final int nameLen, final int line, final int col )
        throws ParseException
    {
        currentOutputHandler.handleAutoCloseElementEnd( buffer, nameOffset, nameLen, line, col );
    }

    @Override
    public void handleUnmatchedCloseElementStart( final char[] buffer, final int nameOffset, final int nameLen, final int line,
                                                  final int col )
        throws ParseException
    {
        currentOutputHandler.handleUnmatchedCloseElementStart( buffer, nameOffset, nameLen, line, col );
    }

    @Override
    public void handleUnmatchedCloseElementEnd( final char[] buffer, final int nameOffset, final int nameLen, final int line,
                                                final int col )
        throws ParseException
    {
        currentOutputHandler.handleUnmatchedCloseElementEnd( buffer, nameOffset, nameLen, line, col );
    }

    @Override
    public void handleAttribute( final char[] buffer, final int nameOffset, final int nameLen, final int nameLine, final int nameCol,
                                 final int operatorOffset, final int operatorLen, final int operatorLine, final int operatorCol,
                                 final int valueContentOffset, final int valueContentLen, final int valueOuterOffset,
                                 final int valueOuterLen, final int valueLine, final int valueCol )
        throws ParseException
    {
        currentOutputHandler.handleAttribute( buffer, nameOffset, nameLen, nameLine, nameCol, operatorOffset, operatorLen, operatorLine,
                                              operatorCol, valueContentOffset, valueContentLen, valueOuterOffset, valueOuterLen, valueLine,
                                              valueCol );
    }

    @Override
    public void handleInnerWhiteSpace( final char[] buffer, final int offset, final int len, final int line, final int col )
        throws ParseException
    {
        currentOutputHandler.handleInnerWhiteSpace( buffer, offset, len, line, col );
    }

    @Override
    public void handleProcessingInstruction( final char[] buffer, final int targetOffset, final int targetLen, final int targetLine,
                                             final int targetCol, final int contentOffset, final int contentLen, final int contentLine,
                                             final int contentCol, final int outerOffset, final int outerLen, final int line,
                                             final int col )
        throws ParseException
    {
        currentOutputHandler.handleProcessingInstruction( buffer, targetOffset, targetLen, targetLine, targetCol, contentOffset, contentLen,
                                                          contentLine, contentCol, outerOffset, outerLen, line, col );
    }
}
