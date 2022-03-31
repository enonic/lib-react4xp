package com.enonic.lib.react4xp.ssr.engineFactory;

import jdk.nashorn.api.scripting.NashornScriptEngine;

/**
 * Created on 10/05/2021 as part of
 */
public interface EngineBuilder {
	@SuppressWarnings("removal")
    public NashornScriptEngine buildEngine();
}
