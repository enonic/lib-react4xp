package com.enonic.lib.react4xp.ssr;

import jdk.nashorn.api.scripting.NashornScriptEngine;

/**
 * Created on 28/04/2021 as part of
 */
public class EngineContainer {
    public final NashornScriptEngine ENGINE;
    public final boolean isFresh;

    public EngineContainer(NashornScriptEngine engine, boolean isFresh) {
        ENGINE = engine;
        this.isFresh = isFresh;
    }


}
