package com.enonic.lib.react4xp.ssr.errors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.script.ScriptException;
import java.io.PrintWriter;
import java.io.StringWriter;

/**
 * Created on 10/05/2021 as part of
 */
public class ErrorHandler {
    private final static Logger LOG = LoggerFactory.getLogger( ErrorHandler.class );

    public static final String KEY_ERROR = "error";

    public String getCleanErrorMessage(Exception e) {
        return e.getMessage().replaceAll(" in <eval> at line number \\d+ at column number \\d++", "");
    }

    public String getLoggableStackTrace(Exception e, String overrideMessage) {
        String message = (overrideMessage == null)
                ? e.getMessage()
                : overrideMessage;
        StringWriter sw = new StringWriter();
        e.printStackTrace(new PrintWriter(sw));
        return e.getClass().getName() + ": " + message + "\n" + sw;
    }

    public String getSolutionTips() {
        return "\nSOLUTION TIPS: The previous error message may refer to lines in compiled/mangled code. To increase readability, you can try react4xp clientside-rendering or building react4xp with buildEnv = development or gradle CLI argument -Pdev. Remember to clear all cached behavior first (stop continuous builds, clear/rebuild your project, restart the XP server, clear browser cache). Actual line numbers in compiled JS source files tends to be referred in the stack trace above: look for '(<eval>: [lineNumber])' on the lines below '...NativeError.java...':.\n\n";
    }

    public String getCodeDump(ScriptException e, String code, String filename) throws ScriptException {
        String fileLabel = (filename != null)
                ? " '" + filename + "'"
                : "";

        return "\n\n" +
                "Code dump:" + fileLabel + "\n" +
                "---------------------------------\n\n + " +
                code + "\n\n" +
                "---------------------------------------\n" +
                "...end of" + fileLabel + " code dump.";
    }
}
