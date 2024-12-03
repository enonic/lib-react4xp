import type { UrlType } from '@enonic-types/lib-react4xp';

import { getUrlType } from '/lib/enonic/react4xp/React4xp/utils/getUrlType';

interface ServiceUrlBuilder {
	setApplication(value: string): void;

	setPath(value: string): void;

	setType(value: string): void;

	setServiceName(value: string): void;

	createUrl(): string;
}

/*
* Initialize the root path of a service URL for a site mount.
*/
export function initServiceUrlRoot({
	serviceName = '',
	urlType // default is app.config['react4xp.urlType'] || 'server'
}: {
	serviceName?: string,
	urlType?: UrlType
} = {}) {
	const bean: ServiceUrlBuilder = __.newBean('com.enonic.lib.react4xp.url.ServiceUrlBuilder');

	bean.setApplication(app.name);
	bean.setPath('/');
	bean.setType(getUrlType(urlType));
	bean.setServiceName(serviceName);

	return bean.createUrl();
}
