//import {toStr} from '@enonic/js-utils/value/toStr';
//import {RESOURCE_PATH_ABSOLUTE_CLIENT_MANIFEST_JSON} from '/lib/enonic/react4xp/constants';
import {readClientManifestJson} from '/lib/enonic/react4xp/asset/client/readClientManifestJson';
import {getAssetRoot} from '/lib/enonic/react4xp/dependencies/getAssetRoot';


export function readClientUrl() {
	//log.debug('readClientUrl()');
    // Special case: if there is a chunkfile for a client wrapper, use that. If not, fall back to
    // a reference to the built-in client wrapper service: _/services/{app.name}/react4xp-client
    try {
		const clientUrl = [getAssetRoot() + readClientManifestJson()['client.js']][0];
		//log.debug('readClientUrl() clientUrls:%s', toStr(clientUrls));
        return clientUrl;
    } catch (e) {
		throw new Error(`Unable to find the client chunk file!!!`);
        //log.debug('Stacktrace', e); // Error: Empty or not found: /assets/react4xp/chunks.client.json
        /*log.debug(
            `No optional clientwrapper was found (chunkfile reference: ${RESOURCE_PATH_ABSOLUTE_CLIENT_MANIFEST_JSON}). That's okay, there's a fallback one at: ${getClientRoot()}`
        );
		const clientRoot = getClientRoot();
		//log.debug('readClientUrl() clientRoot:%s', toStr(clientRoot));
        return clientRoot;*/
    }
}
