import type {
	EntryName,
	OneOrMore,
} from '../../../../index.d';


import {isString} from '@enonic/js-utils/value/isString';


export function forceTrimmedArray(entryNames: OneOrMore<EntryName> = []): EntryName[] {
    if (isString(entryNames)) {
        const trimmed = entryNames.trim();
        return (trimmed === "")
            ? []
            : [trimmed];
    }
    return entryNames.map(entryName => entryName.trim())
}
