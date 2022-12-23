package com.enonic.lib.react4xp.ssr;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

public class RendererCache
{
    private final ConcurrentMap<String, Map<String, String>> map = new ConcurrentHashMap<>();

    public void put( String key, Map<String, String> value )
    {
        map.put( key, value );
    }

    public boolean hasKey( String key )
    {
        return map.containsKey( key );
    }

    public Map<String, String> get( String key )
    {
        return map.get( key );
    }
}
