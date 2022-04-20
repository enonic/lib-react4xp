import {toStr} from '@enonic/js-utils/value/toStr';
import {RESOURCE_PATH_ABSOLUTE_EXECUTOR_MANIFEST_JSON} from '/lib/enonic/react4xp/constants';
import {getResource} from '/lib/enonic/react4xp/resource/getResource';
//@ts-ignore
import {readText} from '/lib/xp/io';
import {IS_PROD_MODE} from '/lib/enonic/xp/runMode';


let CACHED_EXECUTOR_CHUNK_FILE_NAME :string;


export function getExecutorChunkFilename() {
	if (IS_PROD_MODE && CACHED_EXECUTOR_CHUNK_FILE_NAME) {
		return CACHED_EXECUTOR_CHUNK_FILE_NAME;
	}

	const resource = getResource(RESOURCE_PATH_ABSOLUTE_EXECUTOR_MANIFEST_JSON);
	if (!resource || !resource.exists()) {
		throw new Error(
			`Resource empty or not found: ${RESOURCE_PATH_ABSOLUTE_EXECUTOR_MANIFEST_JSON}`
		);
	}

	let content :string;
    try {
        content = readText(resource.getStream());
    } catch (e) {
        log.error(e.message);
        throw new Error(`Error when readText(${RESOURCE_PATH_ABSOLUTE_EXECUTOR_MANIFEST_JSON})!`);
    }
	log.debug('getExecutorChunkFilename() content:%s', toStr(content));

	let executorManifest :{
		'executor.js' :string
	};
	try {
		executorManifest = JSON.parse(content);
		CACHED_EXECUTOR_CHUNK_FILE_NAME = executorManifest['executor.js'];
		log.debug('getExecutorChunkFilename() CACHED_EXECUTOR_CHUNK_FILE_NAME:%s', toStr(CACHED_EXECUTOR_CHUNK_FILE_NAME));
		return CACHED_EXECUTOR_CHUNK_FILE_NAME;
    } catch (e) {
        log.error(e.message);
		log.info(`Dump from resource:${RESOURCE_PATH_ABSOLUTE_EXECUTOR_MANIFEST_JSON} content:${content}`);
        throw new Error(`Error when JSON.parse(${RESOURCE_PATH_ABSOLUTE_EXECUTOR_MANIFEST_JSON})`);
    }
}
