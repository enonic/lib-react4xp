import {getResource as javaGetResource, type Resource} from '/lib/xp/io';


export function getResource(key: string) :Resource {
	return javaGetResource(key);
}
