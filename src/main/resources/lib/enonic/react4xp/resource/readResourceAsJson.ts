import {getResource} from '/lib/enonic/react4xp/resource/getResource';

//@ts-ignore
import {readText} from '/lib/xp/io';


export function readResourceAsJson(fileName :string) :unknown {
	//log.debug("Reading resource: " + JSON.stringify(fileName, null, 2));
    const resource = getResource(fileName);
    if (!resource || !resource.exists()) {
        throw new Error("Empty or not found: " + fileName);
    }

    let content :string;
    try {
        content = readText(resource.getStream());
    } catch (e) {
        log.error(e.message);
        throw new Error("dependencies.es6 # readResourceAsJson: couldn't read resource '" + fileName + "'");
    }

    try {
        return JSON.parse(content);

    } catch (e) {
        log.error(e.message);
        log.info("Content dump from '" + fileName + "':\n" + content);
        throw new Error("dependencies.es6 # readResourceAsJson: couldn't parse as JSON content of resource  '" + fileName + "'");
    }
}
