import {
	EXTERNALS_CHUNKS_FILENAME,
	R4X_TARGETSUBDIR
} from '@enonic/react4xp';
import {dependenciesCache} from '/lib/enonic/react4xp/asset/dependenciesCache';
import {readExternalsUrls} from '/lib/enonic/react4xp/asset/externals/readExternalsUrls';
import {getSiteLocalCacheKey} from '/lib/enonic/react4xp/asset/getSiteLocalCacheKey';


const FULL_EXTERNALS_CHUNKS_FILENAME = `/${R4X_TARGETSUBDIR}/${EXTERNALS_CHUNKS_FILENAME}`;


export function readExternalsUrlsCached() {
    const cacheKey = getSiteLocalCacheKey(FULL_EXTERNALS_CHUNKS_FILENAME);
    return dependenciesCache.get(cacheKey, () => readExternalsUrls());
}
