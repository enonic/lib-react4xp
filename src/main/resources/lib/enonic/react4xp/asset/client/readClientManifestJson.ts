//import {toStr} from 'JS_UTILS_ALIAS/value/toStr';
import {RESOURCE_PATH_ABSOLUTE_CLIENT_MANIFEST_JSON} from '/lib/enonic/react4xp/constants';
import {getResource} from '/lib/enonic/react4xp/resource/getResource';
//@ts-ignore
import {readText} from '/lib/xp/io';


export function readClientManifestJson() :string {
	//log.debug('readClientManifestJson()');

	const resource = getResource(RESOURCE_PATH_ABSOLUTE_CLIENT_MANIFEST_JSON);
	if (!resource || !resource.exists()) {
		throw new Error(
			`Resource empty or not found: ${RESOURCE_PATH_ABSOLUTE_CLIENT_MANIFEST_JSON}`
		);
	}

	let content :string;
    try {
        content = readText(resource.getStream());
    } catch (e) {
        log.error(e.message);
        throw new Error(`Error when readText(${RESOURCE_PATH_ABSOLUTE_CLIENT_MANIFEST_JSON})!`);
    }
	//log.debug('readClientManifestJson() content:%s', toStr(content));

	try {
		return JSON.parse(content);
		//const clientManifest = JSON.parse(content);
		//log.debug('readClientManifestJson() clientManifest:%s', toStr(clientManifest));
		//return clientManifest;

    } catch (e) {
        log.error(e.message);
		log.info(`Dump from resource:${RESOURCE_PATH_ABSOLUTE_CLIENT_MANIFEST_JSON} content:${content}`);
        throw new Error(`Error when JSON.parse(${RESOURCE_PATH_ABSOLUTE_CLIENT_MANIFEST_JSON})`);
    }
} // readClientManifestJson
