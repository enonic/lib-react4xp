import type {EntryName, OneOrMore} from '../../../../index.d';


import {forceTrimmedArray} from '/lib/enonic/react4xp/dependencies/forceTrimmedArray';


export function normalizeEntryNames(entryNames: OneOrMore<EntryName> = []): EntryName[] {
    const arr = forceTrimmedArray(entryNames);
    arr.sort()
    return arr;
}
