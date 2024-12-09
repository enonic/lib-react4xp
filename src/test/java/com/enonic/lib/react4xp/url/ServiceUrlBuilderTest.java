package com.enonic.lib.react4xp.url;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.enonic.xp.content.ContentPath;
import com.enonic.xp.content.ContentService;
import com.enonic.xp.portal.PortalRequest;
import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.site.Site;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class ServiceUrlBuilderTest
{
    private PortalRequest portalRequest;

    private ContentService contentService;

    private BeanContext beanContext;

    ServiceUrlBuilder instance;

    @BeforeEach
    void setUp()
    {
        portalRequest = mock( PortalRequest.class );
        contentService = mock( ContentService.class );
        beanContext = mock( BeanContext.class );
        instance = new ServiceUrlBuilder();

        when( beanContext.getBinding( PortalRequest.class ) ).thenReturn( () -> portalRequest );
        when( beanContext.getService( ContentService.class ) ).thenReturn( () -> contentService );

        instance = new ServiceUrlBuilder();
        instance.initialize( beanContext );
    }

    @Test
    void testOnAdminSiteMount()
    {
        when( portalRequest.getRawPath() ).thenReturn( "/admin/site/preview/myproject/master/mysite/content" );

        final ContentPath contentPath = ContentPath.from( "/mysite/content" );
        when( portalRequest.getContentPath() ).thenReturn( contentPath );

        final Site site = mock( Site.class );
        when( site.getPath() ).thenReturn( ContentPath.from( "/mysite" ) );

        when( contentService.getByPath( eq( contentPath ) ) ).thenReturn( null );
        when( contentService.findNearestSiteByPath( contentPath ) ).thenReturn( site );

        instance.setApplication( "myapp" );
        instance.setServiceName( "myservice" );
        instance.setPath( "/mypath" );
        instance.setType( "server" );

        final String result = instance.createUrl();

        assertEquals( "/admin/site/preview/myproject/master/mysite/_/service/myapp/myservice/mypath", result );
    }

    @Test
    void testOnAdminSiteInlineMount()
    {
        when( portalRequest.getRawPath() ).thenReturn( "/admin/site/inline/myproject/master/mysite/content" );

        final ContentPath contentPath = ContentPath.from( "/mysite/content" );
        when( portalRequest.getContentPath() ).thenReturn( contentPath );

        final Site site = mock( Site.class );
        when( site.getPath() ).thenReturn( ContentPath.from( "/mysite" ) );

        when( contentService.getByPath( eq( contentPath ) ) ).thenReturn( null );
        when( contentService.findNearestSiteByPath( contentPath ) ).thenReturn( site );

        instance.setApplication( "myapp" );
        instance.setServiceName( "myservice" );
        instance.setPath( "/mypath" );
        instance.setType( "server" );

        final String result = instance.createUrl();

        assertEquals( "/admin/site/inline/myproject/master/mysite/_/service/myapp/myservice/mypath", result );
    }

    @Test
    void testOnAdminMount()
    {
        when( portalRequest.getRawPath() ).thenReturn( "/site/myproject/master/mysite/content" );

        final ContentPath contentPath = ContentPath.from( "/mysite/content" );
        when( portalRequest.getContentPath() ).thenReturn( contentPath );

        final Site site = mock( Site.class );
        when( site.getPath() ).thenReturn( ContentPath.from( "/mysite" ) );

        when( contentService.getByPath( eq( contentPath ) ) ).thenReturn( null );
        when( contentService.findNearestSiteByPath( contentPath ) ).thenReturn( site );

        instance.setApplication( "myapp" );
        instance.setServiceName( "myservice" );
        instance.setPath( "/mypath" );
        instance.setType( "server" );

        final String result = instance.createUrl();

        assertEquals( "/site/myproject/master/mysite/_/service/myapp/myservice/mypath", result );
    }

    @Test
    void testInvalidContext()
    {
        when( portalRequest.getRawPath() ).thenReturn( "/admin/tool/myapp/toolname" );

        final ServiceUrlBuilder serviceUrlBuilder = new ServiceUrlBuilder();
        serviceUrlBuilder.initialize( beanContext );

        serviceUrlBuilder.setApplication( "myapp" );
        serviceUrlBuilder.setServiceName( "myservice" );
        serviceUrlBuilder.setPath( "/mypath" );
        serviceUrlBuilder.setType( "server" );

        IllegalArgumentException ex = assertThrows( IllegalArgumentException.class, serviceUrlBuilder::createUrl );
        assertEquals( "Invalid path: \"/admin/tool/myapp/toolname\"", ex.getMessage() );
    }

    @Test
    void testEmptyServiceName()
    {
        when( portalRequest.getRawPath() ).thenReturn( "/admin/tool/myapp/toolname" );

        final ServiceUrlBuilder serviceUrlBuilder = new ServiceUrlBuilder();
        serviceUrlBuilder.initialize( beanContext );

        serviceUrlBuilder.setApplication( "myapp" );
        serviceUrlBuilder.setPath( "/mypath" );
        serviceUrlBuilder.setType( "server" );

        NullPointerException ex = assertThrows( NullPointerException.class, serviceUrlBuilder::createUrl );
        assertEquals( "Service name is required", ex.getMessage() );
    }
}
