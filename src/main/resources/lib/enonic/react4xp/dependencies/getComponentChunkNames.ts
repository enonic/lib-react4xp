import type {EntryName, OneOrMore} from '../../../../index.d';


//import {toStr} from '@enonic/js-utils/value/toStr';
import {forceTrimmedArray} from '/lib/enonic/react4xp/dependencies/forceTrimmedArray';
import {readComponentChunkNames} from '/lib/enonic/react4xp/dependencies/readComponentChunkNames';


export function getComponentChunkNames(entryNames: OneOrMore<EntryName>) {
	return readComponentChunkNames(forceTrimmedArray(entryNames));
}
