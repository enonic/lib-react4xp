import {h64} from 'xxhashjs';
//import {xxhash64} from '../hash/xxhash64';
//import {readResourceLines} from './readResourceLines';
//import {readResourceText} from './readResourceText';
import {getResourceStream} from './getResourceStream';
//@ts-ignore
import {processLines} from '/lib/xp/io';


export function hashResource(key :string) {
	log.debug('hashResource(%s)', key);
	//return xxhash64(readResourceLines(key)); // ReferenceError: "Buffer" is not defined
	//return xxhash64(readResourceText(key));
	const stream = getResourceStream(key);
	const hash = h64();
	//log.debug('xxhash64() hash:%s', toStr(hash));
	processLines(stream, (line :string) => {
		hash.update(line);
	});

	const digest = hash.digest();
	//log.debug('xxhash64() digest:%s', toStr(digest));

	const hex = digest.toString(16);
	log.debug('xxhash64() hex:%s', hex);
	return hex;
}
