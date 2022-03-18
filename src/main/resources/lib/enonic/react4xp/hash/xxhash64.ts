import {toStr} from '@enonic/js-utils/value/toStr';
//import xxhash from "xxhash-wasm";
import {h64} from 'xxhashjs';
//import xxhashjs from 'xxhashjs';

//const { h64 } = await xxhash(); // tsconfig.json target must be esnext or newer...

export function xxhash64(string :string|Array<string>) :string {
	//log.debug('xxhash64(%s)', string);
	//const { h64 } = await xxhash(); // only allowed in async functions
	//return h64(string).toString(16);
	/*return xxhash().then(hasher => {
		return hasher.h64ToString(string);
	});*/

	const hash = h64();
	//log.debug('xxhash64() hash:%s', toStr(hash));

	const digest = hash.update(string).digest();
	//log.debug('xxhash64() digest:%s', toStr(digest));

	const hex = digest.toString(16);
	log.debug('xxhash64() hex:%s', hex);
	return hex;
};
