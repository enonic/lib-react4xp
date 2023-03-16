import {readText} from '/lib/xp/io';
import {getResourceStream} from './getResourceStream';


export function readResourceText(key: string): string {
	return readText(getResourceStream(key));
}
