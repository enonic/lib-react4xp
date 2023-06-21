package com.enonic.lib.react4xp.ssr.resources;

import java.util.function.Supplier;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.resource.Resource;
import com.enonic.xp.resource.ResourceKey;
import com.enonic.xp.resource.ResourceService;


public class ResourceReaderImpl
    implements ResourceReader
{
    private final static Logger LOG = LoggerFactory.getLogger( ResourceReaderImpl.class );

    private final Supplier<ResourceService> resourceServiceSupplier;

    private final ApplicationKey applicationKey;

    public ResourceReaderImpl( Supplier<ResourceService> resourceServiceSupplier, ApplicationKey applicationKey )
    {
        this.resourceServiceSupplier = resourceServiceSupplier;
        this.applicationKey = applicationKey;
    }

    public String readResource( String resourcePath )
    {
        LOG.debug( "reading resource '{}'", resourcePath );
        Resource resource = resourceServiceSupplier.get().getResource( ResourceKey.from( applicationKey, resourcePath ) );
        final String read = resource.readString();
        LOG.debug( "read resource '{}' length {}", resourcePath, read.length() );
        return read;
    }
}
