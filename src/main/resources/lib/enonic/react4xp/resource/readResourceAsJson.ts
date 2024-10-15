import {getResource} from '/lib/enonic/react4xp/resource/getResource';
import {readText} from '/lib/xp/io';


export function readResourceAsJson(fileName: string): unknown {
	// log.debug('readResourceAsJson() Reading resource: %s', fileName);
    const resource = getResource(fileName);
    if (!resource || !resource.exists()) {
        throw new Error("Empty or not found: " + fileName);
    }

    let content: string;
    try {
        content = readText(resource.getStream());
		// log.debug('readResourceAsJson() content: %s', content);
    } catch (e) {
        log.error(e.message);
        throw new Error("dependencies.es6 # readResourceAsJson: couldn't read resource '" + fileName + "'");
    }

    try {
		const obj = JSON.parse(content);
		// log.debug('readResourceAsJson() obj: %s', JSON.stringify(obj, null, 4));
        return obj;

    } catch (e) {
        log.error(e.message);
        log.info("Content dump from '" + fileName + "':\n" + content);
        throw new Error("dependencies.es6 # readResourceAsJson: couldn't parse as JSON content of resource  '" + fileName + "'");
    }
}
