package com.enonic.lib.react4xp.ssr.resources;

import java.io.IOException;

public interface ResourceReader
{
    String readResource(String resourcePath) throws IOException;
}
