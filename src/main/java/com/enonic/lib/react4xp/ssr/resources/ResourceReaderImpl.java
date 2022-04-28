package com.enonic.lib.react4xp.ssr.resources;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.function.Supplier;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.enonic.lib.react4xp.ssr.Config;
import com.enonic.lib.react4xp.ssr.errors.ErrorHandler;
import com.enonic.xp.resource.Resource;
import com.enonic.xp.resource.ResourceKey;
import com.enonic.xp.resource.ResourceService;


public class ResourceReaderImpl
    implements ResourceReader
{
    private final static Logger LOG = LoggerFactory.getLogger( ResourceReaderImpl.class );

    // public static final boolean IS_PRODMODE = (RunMode.get() == RunMode.PROD);

    private final long id;

    private final Supplier<ResourceService> resourceServiceSupplier;

    private final Config config;

    public ResourceReaderImpl( Supplier<ResourceService> resourceServiceSupplier, Config config, long id )
    {
        this.id = id;
        this.resourceServiceSupplier = resourceServiceSupplier;
        this.config = config;
    }

    public String readResource( String resourcePath )
        throws IOException
    {
        // if (!IS_PRODMODE) {
        LOG.debug( this + ": reading resource '" + resourcePath + "'" );
        // }

        String url = null;
        try
        {
            url = config.APP_NAME + ":" + resourcePath;
            ResourceKey resourceKey = ResourceKey.from( url );
            Resource resource = resourceServiceSupplier.get().getResource( resourceKey );
            return resource.getBytes().asCharSource( StandardCharsets.UTF_8 ).read();

        }
        catch ( IOException e )
        {
            ErrorHandler errorHandler = new ErrorHandler();
            LOG.error(
                errorHandler.getLoggableStackTrace( e, null ) + "\n\n" + e.getClass().getSimpleName() + ": " + e.getMessage() + "\n" +
                    "in " + this.getClass().getName() + "\n" + "resource url = '" + url + "'\n" + errorHandler.getSolutionTips() );

            throw e;
        }
    }

    public String toString()
    {
        return ResourceReaderImpl.class.getSimpleName() + "#" + id;
    }
}
