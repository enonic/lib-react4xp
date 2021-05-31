package com.enonic.lib.react4xp.ssr.errors;

public class RenderException extends RuntimeException {
    private final String message;
    private final String stacktraceString;

    public RenderException(String message, String stacktraceString) {
        super(new RuntimeException(message));
        this.message = message;
        this.stacktraceString = stacktraceString;
    }

    public RenderException(String message) {
        super(new RuntimeException(message));
        this.message = message;
        this.stacktraceString = null;
    }

    public RenderException(Exception e) {
        super(e);
        this.message = e.getMessage();
        this.stacktraceString = null;
    }
    public RenderException(Exception e, String message) {
        super(e);
        this.message = (message != null)
            ? message
            : e.getMessage();
        this.stacktraceString = null;
    }

    @Override
    public String getMessage() {
        return message;
    }
    public String getStacktraceString() {
        return stacktraceString;
    }
}
