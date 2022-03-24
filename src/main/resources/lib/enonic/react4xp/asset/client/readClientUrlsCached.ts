//import {toStr} from '@enonic/js-utils/value/toStr';
import {RESOURCE_PATH_ABSOLUTE_CLIENT_MANIFEST_JSON} from '/lib/enonic/react4xp/constants';
import {readClientUrls} from '/lib/enonic/react4xp/asset/client/readClientUrls';
import {dependenciesCache} from '/lib/enonic/react4xp/asset/dependenciesCache';
import {getSiteLocalCacheKey} from '/lib/enonic/react4xp/asset/getSiteLocalCacheKey';




/** Returns the asset-via-service URL for the frontend client */
export function readClientUrlsCached() {
	//log.debug('readClientUrlsCached()');
    const cacheKey = getSiteLocalCacheKey(RESOURCE_PATH_ABSOLUTE_CLIENT_MANIFEST_JSON);
	//log.debug('readClientUrlsCached() cacheKey:%s', toStr(cacheKey));
	//const clientUrls =
	return dependenciesCache.get(cacheKey, () => readClientUrls());
	//log.debug('readClientUrlsCached() clientUrls:%s', toStr(clientUrls));
    //return clientUrls;
}
