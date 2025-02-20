import type {Response} from '@enonic-types/core';
import type {Resource} from '@enonic-types/lib-io';

import {forceArray} from '@enonic/js-utils/array/forceArray';
import {readLines} from '/lib/xp/io';


// Adjusted from https://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
export function hash(string: string) {
	let hash = 0; // TODO Should it be string '0', rather than number 0
	if (string.length === 0) return hash;
	for (let i = 0; i < string.length; i++) {
    	const chr = string.charCodeAt(i);
    	hash = (hash << 5) - hash + chr;
    	hash |= 0; // Convert to 32bit integer
  	} // for
	return Math.abs(hash).toString(36);
};


export function getResourceAsString(resource: Resource) {
	return forceArray(readLines(resource.getStream())).join('\n');
}


export function getReact4xpEntry(resource: Resource): Response {
  //const then = new Date().getTime();
  const fileContent = getResourceAsString(resource);
  const ETag = hash(fileContent);
  //const now = new Date().getTime();
  //.info(`ETag '${ETag}' in ${now - then} ms.`);
  return {
    body: fileContent,
    headers: {
      "Content-Type": "application/javascript;charset=utf-8",
      "Cache-Control": "no-cache",
      ETag
    }
  };
}


export function getReact4xpHashedChunk(
	resource: Resource,
	isCss: boolean
) :Response {
  const fileContent = getResourceAsString(resource);
  return {
    body: fileContent,
    headers: {
      "Content-Type": isCss
        ? "text/css;charset=utf-8"
        : "application/javascript;charset=utf-8",
      "Cache-Control": "public, max-age=31536000"
    }
  };
}
