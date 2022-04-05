//import {toStr} from '@enonic/js-utils/value/toStr';
import {RESOURCE_PATH_ABSOLUTE_CLIENT_MANIFEST_JSON} from '/lib/enonic/react4xp/constants';
import {readClientUrl} from '/lib/enonic/react4xp/asset/client/readClientUrl';
import {dependenciesCache} from '/lib/enonic/react4xp/asset/dependenciesCache';
import {getSiteLocalCacheKey} from '/lib/enonic/react4xp/asset/getSiteLocalCacheKey';




/** Returns the asset-via-service URL for the frontend client */
export function readClientUrlCached() :string {
	//log.debug('readClientUrlCached()');
    const cacheKey = getSiteLocalCacheKey(RESOURCE_PATH_ABSOLUTE_CLIENT_MANIFEST_JSON);
	//log.debug('readClientUrlCached() cacheKey:%s', toStr(cacheKey));
	//const clientUrls =
	return dependenciesCache.get(cacheKey, () => readClientUrl());
	//log.debug('readClientUrlCached() clientUrls:%s', toStr(clientUrls));
    //return clientUrls;
}
