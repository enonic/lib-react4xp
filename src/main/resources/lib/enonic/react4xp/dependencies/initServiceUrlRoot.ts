import { assetUrl as getAssetUrl } from '/lib/xp/portal';
import { getUrlType } from '/lib/enonic/react4xp/React4xp/utils/getUrlType';

/*
* Asseturl should work in any context.
* Hack until lib-static generates perfect static asset urls.
*/
export function initServiceUrlRoot({
	serviceName = '',
	urlType // default is app.config['react4xp.urlType'] || 'server'
}: {
	serviceName?: string,
	urlType?: 'server' | 'absolute'
} = {}) {
	const assetUrl = getAssetUrl({
		path:'/',
		type: getUrlType(urlType)
	});
	// log.debug('initServiceUrlRoot(%s) assetUrl:%s', serviceName, assetUrl);
	const serviceUrlRoot = assetUrl
		.replace(/\/edit\/([^\/]+)\/([^\/]+)\/_\/asset/,'/preview/$1/$2/_/asset') // Fix BUG Assets give 404 in edit mode #476
		.replace(/\/_\/asset\/.*$/, `/_/service/${app.name}/${serviceName}/`)
		.replace(/\/{2,}$/, '/');
	// log.debug('initServiceUrlRoot(%s) -> %s', serviceName, serviceUrlRoot);
	return serviceUrlRoot;
}
