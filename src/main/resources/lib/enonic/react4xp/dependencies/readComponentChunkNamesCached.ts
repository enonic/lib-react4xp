import type {
	OneOrMore,
	React4xp as React4xpNamespace
} from '../../../../index.d';


//import {toStr} from '@enonic/js-utils/value/toStr';
import {dependenciesCache} from '/lib/enonic/react4xp/asset/dependenciesCache';
import {getSiteLocalCacheKey} from '/lib/enonic/react4xp/asset/getSiteLocalCacheKey';
import {normalizeEntryNames} from '/lib/enonic/react4xp/dependencies/normalizeEntryNames'
import {readComponentChunkNames} from '/lib/enonic/react4xp/dependencies/readComponentChunkNames';


// WARNING: Do not cache anything that contains assetRoot, it changes per context!
// But since this doesn't contain assetRoot, it's ok to cache :)
// Cached version of readComponentChunkNames - used in prod mode
export function readComponentChunkNamesCached(entryNames :OneOrMore<React4xpNamespace.EntryName>) :Array<string> {
    entryNames = normalizeEntryNames(entryNames);

    const cacheKey = getSiteLocalCacheKey(entryNames.join("*"));
	//log.debug('readComponentChunkNamesCached(%s) cacheKey:%s', toStr(entryNames), cacheKey);

    const componentChunkNamesCached = dependenciesCache.get(cacheKey, () => readComponentChunkNames(entryNames));
	//log.debug('readComponentChunkNamesCached(%s) cacheKey:%s -> %s', toStr(entryNames), cacheKey, toStr(componentChunkNamesCached));
	return componentChunkNamesCached;
}
