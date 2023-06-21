package com.enonic.lib.react4xp.ssr.engine;

import javax.script.ScriptEngine;

public class EngineFactory
{
    private final EngineBuilderPlatform engineBuilder;

    public EngineFactory( String engineName )
    {
        this.engineBuilder = new EngineBuilderPlatform( engineName );
    }

    public ScriptEngine buildEngine()
    {
        return engineBuilder.buildEngine();
    }
}
