//import {toStr} from '@enonic/js-utils/value/toStr';
//import {RESOURCE_PATH_ABSOLUTE_CLIENT_MANIFEST_JSON} from '/lib/enonic/react4xp/constants';
import {readClientManifestJson} from '/lib/enonic/react4xp/asset/client/readClientManifestJson';
import {getAssetRoot} from '/lib/enonic/react4xp/dependencies/getAssetRoot';


export function readClientUrls() {
	//log.debug('readClientUrls()');
    // Special case: if there is a chunkfile for a client wrapper, use that. If not, fall back to
    // a reference to the built-in client wrapper service: _/services/{app.name}/react4xp-client
    try {
		const clientUrls = [getAssetRoot() + readClientManifestJson()['client.js']];
		//log.debug('readClientUrls() clientUrls:%s', toStr(clientUrls));
        return clientUrls;
    } catch (e) {
		throw new Error(`Unable to find the client chunk file!!!`);
        //log.debug('Stacktrace', e); // Error: Empty or not found: /assets/react4xp/chunks.client.json
        /*log.debug(
            `No optional clientwrapper was found (chunkfile reference: ${RESOURCE_PATH_ABSOLUTE_CLIENT_MANIFEST_JSON}). That's okay, there's a fallback one at: ${getClientRoot()}`
        );
		const clientRoot = getClientRoot();
		//log.debug('readClientUrls() clientRoot:%s', toStr(clientRoot));
        return [clientRoot];*/
    }
}
