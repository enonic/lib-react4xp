//@ts-ignore
import {readLines} from '/lib/xp/io';
import {getResourceStream} from './getResourceStream';


export function readResourceLines(key :string) :Array<string> {
	return readLines(getResourceStream(key));
}
