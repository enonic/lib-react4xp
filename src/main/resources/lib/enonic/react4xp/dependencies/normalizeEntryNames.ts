import type {
	OneOrMore,
	React4xp as React4xpNamespace
} from '../../../../index.d';


import {forceTrimmedArray} from '/lib/enonic/react4xp/dependencies/forceTrimmedArray';


export function normalizeEntryNames(entryNames :OneOrMore<React4xpNamespace.EntryName> = []) :Array<React4xpNamespace.EntryName> {
    const arr = forceTrimmedArray(entryNames);
    arr.sort()
    return arr;
}
