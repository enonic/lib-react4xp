//import {toStr} from '@enonic/js-utils/value/toStr';
import {readClientManifestJson} from '/lib/enonic/react4xp/asset/client/readClientManifestJson';
import {IS_DEV_MODE} from '/lib/enonic/xp/runMode';


const CLIENT_CHUNKS_FILENAME = readClientManifestJson()['client.js'];


export function getClientChunkFilename() {
	//log.debug('getClientChunkFilename()');
	if (IS_DEV_MODE) {
		return readClientManifestJson()['client.js'];
		/*const clientChunksJson = readClientChunksJson();
		log.debug('getClientChunkFilename() clientChunksJson:%s', toStr(clientChunksJson));
		return clientChunksJson[0];*/
	}
	//log.debug('getClientChunkFilename() CLIENT_CHUNKS_FILENAME:%s', toStr(CLIENT_CHUNKS_FILENAME));
	return CLIENT_CHUNKS_FILENAME
}
