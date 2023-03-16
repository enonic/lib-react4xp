import type {
	OneOrMore,
	React4xp as React4xpNamespace
} from '../../../../index.d';


//import {toStr} from '@enonic/js-utils/value/toStr';
import {forceTrimmedArray} from '/lib/enonic/react4xp/dependencies/forceTrimmedArray';
import {readComponentChunkNames} from '/lib/enonic/react4xp/dependencies/readComponentChunkNames';
import {readComponentChunkNamesCached} from '/lib/enonic/react4xp/dependencies/readComponentChunkNamesCached';
import {IS_PROD_MODE} from '/lib/enonic/react4xp/xp/runMode';


export function getComponentChunkNames(entryNames :OneOrMore<React4xpNamespace.EntryName>) {
	const componentChunkNames = IS_PROD_MODE
    	? readComponentChunkNamesCached(entryNames)
    	: readComponentChunkNames(forceTrimmedArray(entryNames));
	//log.debug('getComponentChunkNames(%s) -> %s', toStr(entryNames), toStr(componentChunkNames));
	return componentChunkNames;
}
