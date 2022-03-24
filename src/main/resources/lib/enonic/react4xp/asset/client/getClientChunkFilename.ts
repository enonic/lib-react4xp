//import {toStr} from '@enonic/js-utils/value/toStr';
import {readClientChunksJson} from '/lib/enonic/react4xp/asset/client/readClientChunksJson';
import {IS_DEV_MODE} from '/lib/enonic/xp/runMode';


const CLIENT_CHUNKS_JSON = readClientChunksJson();


export function getClientChunkFilename() {
	//log.debug('getClientChunkFilename()');
	if (IS_DEV_MODE) {
		return readClientChunksJson()[0];
		/*const clientChunksJson = readClientChunksJson();
		log.debug('getClientChunkFilename() clientChunksJson:%s', toStr(clientChunksJson));
		return clientChunksJson[0];*/
	}
	//log.debug('getClientChunkFilename() CLIENT_CHUNKS_JSON:%s', toStr(CLIENT_CHUNKS_JSON));
	return CLIENT_CHUNKS_JSON[0];
}
