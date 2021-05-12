package com.enonic.lib.react4xp.ssr.errors;

public class RenderException extends RuntimeException {
    private final String message;

    public RenderException(String message) {
        super(new RuntimeException(message));
        this.message = message;
    }

    public RenderException(Exception e) {
        super(e);
        this.message = e.getMessage();
    }
    public RenderException(Exception e, String message) {
        super(e);
        this.message = (message != null)
            ? message
            : e.getMessage();
    }

    @Override
    public String getMessage() {
        return message;
    }
}
