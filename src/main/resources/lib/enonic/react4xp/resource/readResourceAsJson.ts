import {
	getResource,
	readText
	//@ts-ignore
} from '/lib/xp/io';


export function readResourceAsJson(fileName :string) :unknown {
	//log.debug("Reading resource: " + JSON.stringify(fileName, null, 2));
    const resource = getResource(fileName);
    if (!resource || !resource.exists()) {
        throw Error("Empty or not found: " + fileName);
    }
    let content :string;
    try {
        content = readText(resource.getStream());
    } catch (e) {
        log.error(e.message);
        throw Error("dependencies.es6 # readResourceAsJson: couldn't read resource '" + fileName + "'");
    }

    try {
        return JSON.parse(content);

    } catch (e) {
        log.error(e.message);
        log.info("Content dump from '" + fileName + "':\n" + content);
        throw Error("dependencies.es6 # readResourceAsJson: couldn't parse as JSON content of resource  '" + fileName + "'");
    }
}
