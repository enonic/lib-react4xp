import type { UrlType } from '@enonic-types/lib-react4xp';

import { getUrlType } from '/lib/enonic/react4xp/React4xp/utils/getUrlType';

import { serviceUrl } from '/lib/enonic/react4xp/serviceUrl';

/*
* Initialize the root path of a service URL for a site mount.
*/
export function initServiceUrlRoot({
	serviceName = '',
	urlType = getUrlType()
}: {
	serviceName?: string,
	urlType?: UrlType
} = {}) {
	return serviceUrl({
		application: app.name,
		path: '/',
		service: serviceName,
		type: urlType
	});
}
