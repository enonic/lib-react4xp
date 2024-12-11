import type {ByteSource} from '/lib/xp/io';


import {getResource} from '/lib/enonic/react4xp/resource/getResource';


export function getResourceStream(key: string): ByteSource {
	return getResource(key).getStream();
}
