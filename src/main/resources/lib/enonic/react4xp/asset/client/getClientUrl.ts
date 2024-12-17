import type { UrlType } from '/types';


import { readClientManifestJson } from '/lib/enonic/react4xp/asset/client/readClientManifestJson';
import { getAssetRoot } from '/lib/enonic/react4xp/dependencies/getAssetRoot';


// WARNING: Do not cache anything that contains assetRoot, it changes per context!
export function getClientUrl({
	urlType // default is app.config['react4xp.urlType'] || 'server'
}: {
	urlType?: UrlType
} = {}) {
	// log.debug('getClientUrl()');
	// Special case: if there is a chunkfile for a client wrapper, use that. If not, fall back to
	// a reference to the built-in client wrapper service: _/services/{app.name}/react4xp-client
	try {
		const clientUrl = getAssetRoot({ urlType }) + readClientManifestJson()['client.js'];
		// log.debug('getClientUrl() -> %s', clientUrl);
		return clientUrl;
	} catch (e) {
		throw new Error(`Unable to find the client chunk file!!!`);
		// log.debug('Stacktrace', e); // Error: Empty or not found: /r4xAssets/chunks.client.json
		// log.debug(
		// 	`No optional clientwrapper was found (chunkfile reference: ${RESOURCE_PATH_ABSOLUTE_CLIENT_MANIFEST_JSON}). That's okay, there's a fallback one at: ${getClientRoot()}`
		// );
		// const clientRoot = getClientRoot();
		// log.debug('getClientUrl() clientRoot:%s', toStr(clientRoot));
		// return clientRoot;
	}
}
