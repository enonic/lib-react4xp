import {assetUrl as getAssetUrl} from '/lib/xp/portal';

/*
* Asseturl should work in any context.
* Hack until lib-static generates perfect static asset urls.
*/
export function initServiceUrlRoot(serviceName = '') {
	const assetUrl = getAssetUrl({path:'/'});
	//log.debug('initServiceUrlRoot(%s) assetUrl:%s', serviceName, assetUrl);
	const serviceUrlRoot = assetUrl
        .replace(/\/edit\/([^\/]+)\/([^\/]+)\/_\/asset/,'/preview/$1/$2/_/asset') // Fix BUG Assets give 404 in edit mode #476
		.replace(/\/_\/asset\/.*$/, `/_/service/${app.name}/${serviceName}/`)
		.replace(/\/{2,}/g, '/');
	//log.debug('initServiceUrlRoot(%s) -> %s', serviceName, serviceUrlRoot);
	return serviceUrlRoot;
}
