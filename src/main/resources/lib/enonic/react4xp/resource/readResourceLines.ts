import {readLines} from '/lib/xp/io';
import {getResourceStream} from '/lib/enonic/react4xp/resource/getResourceStream';


export function readResourceLines(key: string): string[] {
	return readLines(getResourceStream(key));
}
