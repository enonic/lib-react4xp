import type {
	OneOrMore,
	React4xp as React4xpNamespace
} from '../../../../index.d';


import {dependenciesCache} from '/lib/enonic/react4xp/asset/dependenciesCache';
import {getSiteLocalCacheKey} from '/lib/enonic/react4xp/asset/getSiteLocalCacheKey';
import {normalizeEntryNames} from '/lib/enonic/react4xp/dependencies/normalizeEntryNames'
import {readComponentChunkNames} from '/lib/enonic/react4xp/dependencies/readComponentChunkNames';


// Cached version of readComponentChunkNames - used in prod mode
export function readComponentChunkNamesCached(entryNames :OneOrMore<React4xpNamespace.EntryName>) :Array<string> {
    entryNames = normalizeEntryNames(entryNames);

    const cacheKey = getSiteLocalCacheKey(entryNames.join("*"));
    return dependenciesCache.get(cacheKey, () => readComponentChunkNames(entryNames));
}
