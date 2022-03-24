//import {toStr} from '@enonic/js-utils/value/toStr';
import {
	CLIENT_CHUNKS_FILENAME,
	R4X_TARGETSUBDIR
} from '@enonic/react4xp';
import {readClientUrls} from '/lib/enonic/react4xp/asset/client/readClientUrls';
import {dependenciesCache} from '/lib/enonic/react4xp/asset/dependenciesCache';
import {getSiteLocalCacheKey} from '/lib/enonic/react4xp/asset/getSiteLocalCacheKey';


const FULL_CLIENT_CHUNKS_FILENAME = `/${R4X_TARGETSUBDIR}/${CLIENT_CHUNKS_FILENAME}`;


/** Returns the asset-via-service URL for the frontend client */
export function readClientUrlsCached() {
	//log.debug('readClientUrlsCached()');
    const cacheKey = getSiteLocalCacheKey(FULL_CLIENT_CHUNKS_FILENAME);
	//log.debug('readClientUrlsCached() cacheKey:%s', toStr(cacheKey));
	const clientUrls = dependenciesCache.get(cacheKey, () => readClientUrls());
	//log.debug('readClientUrlsCached() clientUrls:%s', toStr(clientUrls));
    return clientUrls;
}
