import type {ByteSource} from '/lib/xp/io';


import {getResource} from './getResource';


export function getResourceStream(key: string): ByteSource {
	return getResource(key).getStream();
}
