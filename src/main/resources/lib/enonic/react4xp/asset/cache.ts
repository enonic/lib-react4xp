import type {
	Request,
	Response
} from '../../../..';


import {includes} from '@enonic/js-utils/array/includes';
import lcKeys from '@enonic/js-utils/object/lcKeys';
import {cleanAnyDoubleQuoteWrap} from '@enonic/js-utils/string/cleanAnyDoubleQuoteWrap';
import {startsWith} from '@enonic/js-utils/string/startsWith';
//import {toStr} from '@enonic/js-utils/value/toStr';
//@ts-ignore
import {newCache} from '/lib/cache';
import {eTagGetter} from './eTagGetter';
import {getImmutables} from './getImmutables';
import {getEntries} from './getEntries';
import {immutableGetter} from './immutableGetter';


const ENTRIES = getEntries();
//log.debug('handleAssetRequest ENTRIES:%s', toStr(ENTRIES));
const IMMUTABLES = getImmutables(ENTRIES);
//log.debug('handleAssetRequest IMMUTABLES:%s', toStr(IMMUTABLES));


const assetResponseCache = newCache({
	size: 300,
	expire: 60*60*24*365 // 1 year
});


const eTagCache = newCache({
	size: 300,
	//expire: 60 // 1 minute
	expire: 60*60 // 1 hour
});


export function clearAssetResponseCache() {
	assetResponseCache.clear()
}


export function clearETagCache() {
	eTagCache.clear()
}


export function expireETag(ETag :string) {
	return eTagCache.remove(ETag);
}


export function expireAsset({
	assetPath,
	ETag
}) {
	const cacheKey = `${assetPath}?ETag=${ETag}`;
	return assetResponseCache.remove(cacheKey);
}


export function getCachedETag(assetPath :string) {
	//let fromCache = true;
	const etag = eTagCache.get(assetPath, () => {
		//fromCache = false;
		const response = eTagGetter({ rawPath: assetPath });
		const {headers} = response;
		const lcHeaders = lcKeys(headers) as typeof headers;
		const {etag} = lcHeaders; // Starts and ends with double quotes
		const cleanedETag = cleanAnyDoubleQuoteWrap(etag);
		//log.debug('getCachedETag(%s) --> %s (added to cache)', assetPath, ETag);
		return cleanedETag;
	}) as string;
	/*if (fromCache) {
		log.debug('getCachedETag(%s) --> %s (from cache)', assetPath, ETag);
	}*/
	return etag;
} // getCachedETag


export function getCachedAssetResponse(request: Partial<Request>) {
	//log.debug('getCachedAssetResponse() request:%s', toStr(request));
	const {
		contextPath = '',
		/*headers: {
			'If-None-Match': ifNoneMatch // "4b9707302f03e8ba--gzip" // Same as ETag from previous Response
		} = {},*/
		params: {
			ETag
		} = {},
		//path,
		rawPath
	} = request;

	//const cleanIfNoneMatch = cleanAnyDoubleQuoteWrap(ifNoneMatch); // 4b9707302f03e8ba
	//log.debug('getCachedAssetResponse() cleanIfNoneMatch:%s', toStr(cleanIfNoneMatch));

	let cleanPath = rawPath.substring(contextPath.length);
	if (startsWith(cleanPath, '/')) {
		cleanPath = cleanPath.substring(1);
	}

	if (ETag) {
		const cacheKey = `${cleanPath}?ETag=${ETag}`;
		const cachedResponse = assetResponseCache.get(cacheKey, () => {
			//log.debug('getCachedAssetResponse() caching cacheKey:%s to response', cacheKey);
			return immutableGetter(request);
		}) as Response;
		return cachedResponse;
	}

	if (IMMUTABLES[cleanPath]) {
		return immutableGetter(request);
	}

	if (!includes(ENTRIES, cleanPath)) {
		log.debug('handleAssetRequest() unable to determine whether immutable falling back to eTagGetter cleanPath:%s', cleanPath);
	}

	return eTagGetter(request); // Handles ifNoneMatch requests?
}
