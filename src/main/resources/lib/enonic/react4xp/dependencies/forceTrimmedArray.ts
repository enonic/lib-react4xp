import type {
	OneOrMore,
	React4xp as React4xpNamespace
} from '../../../../index.d';


import {isString} from '@enonic/js-utils/value/isString';


export function forceTrimmedArray(entryNames :OneOrMore<React4xpNamespace.EntryName> = []) :Array<React4xpNamespace.EntryName> {
    if (isString(entryNames)) {
        const trimmed = entryNames.trim();
        return (trimmed === "")
            ? []
            : [trimmed];
    }
    return entryNames.map(entryName => entryName.trim())
}
