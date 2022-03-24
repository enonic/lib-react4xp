//import {toStr} from '@enonic/js-utils/value/toStr';
import {
	CLIENT_CHUNKS_FILENAME,
	R4X_TARGETSUBDIR
} from '@enonic/react4xp';
import {readClientChunksJson} from '/lib/enonic/react4xp/asset/client/readClientChunksJson';
import {
	getAssetRoot,
	getClientRoot
} from '/lib/enonic/react4xp/serviceRoots';


const FULL_CLIENT_CHUNKS_FILENAME = `/${R4X_TARGETSUBDIR}/${CLIENT_CHUNKS_FILENAME}`;


export function readClientUrls() {
	//log.debug('readClientUrls()');
    // Special case: if there is a chunkfile for a client wrapper, use that. If not, fall back to
    // a reference to the built-in client wrapper service: _/services/{app.name}/react4xp-client
    try {
		const clientUrls = readClientChunksJson().map(
            name => getAssetRoot() + name
        );
		//log.debug('readClientUrls() clientUrls:%s', toStr(clientUrls));
        return clientUrls;
    } catch (e) {
        //log.debug('Stacktrace', e); // Error: Empty or not found: /assets/react4xp/chunks.client.json
        log.debug(
            `No optional clientwrapper was found (chunkfile reference: ${FULL_CLIENT_CHUNKS_FILENAME}). That's okay, there's a fallback one at: ${getClientRoot()}`
        );
		const clientRoot = getClientRoot();
		//log.debug('readClientUrls() clientRoot:%s', toStr(clientRoot));
        return [clientRoot];
    }
}
