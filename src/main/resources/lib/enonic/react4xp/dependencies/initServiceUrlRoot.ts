//import {toStr} from '@enonic/js-utils/value/toStr';
import {
	getSite,
	pageUrl,
	serviceUrl
	//@ts-ignore
} from '/lib/xp/portal';


/* WARNING:
* Caching is a really bad idea as visitors may come from different contexts:
* Say the first visitor is a site administrator previewing the page in Content Studio,
*  then the cached urls will contain /admin/ in the url...
* Then when an external vistor goes to public url, the assetUrl still contains /admin/ !!!
*/
export function initServiceUrlRoot(serviceName :string) {
    const siteId = (getSite() || {})._id;
	//log.debug('siteId:%s', siteId);

    if (siteId) {
        const siteUrl = pageUrl({id: siteId}); // Just / depends on vhost
		//log.debug('siteUrl:%s', siteUrl);
		//const rootUrl = pageUrl({path: '/'}); // /_/error/400?message=URI+out+of+scope
        return `${siteUrl}/_/service/${app.name}/${serviceName}/`.replace(/\/+/, '/');
    }
    return serviceUrl({service: serviceName}) + '/';
}
