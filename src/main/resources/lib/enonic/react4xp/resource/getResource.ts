import type {Resource} from '@enonic-types/lib-io';

import {getResource as javaGetResource} from '/lib/xp/io';


export function getResource(key: string) :Resource {
	return javaGetResource(key);
}
