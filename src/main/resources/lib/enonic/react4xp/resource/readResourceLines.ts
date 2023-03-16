import {readLines} from '/lib/xp/io';
import {getResourceStream} from './getResourceStream';


export function readResourceLines(key: string): string[] {
	return readLines(getResourceStream(key));
}
