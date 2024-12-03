import type { UrlType } from '@enonic-types/lib-react4xp';


import { initServiceUrlRoot } from '/lib/enonic/react4xp/dependencies/initServiceUrlRoot';


export function getAssetRoot({
	urlType // default is app.config['react4xp.urlType'] || 'server'
}: {
	urlType?: UrlType
} = {}) {
	// log.debug('getAssetRoot({ type: %s })', type);
	return initServiceUrlRoot({
		serviceName: 'react4xp',
		urlType
	});
};
