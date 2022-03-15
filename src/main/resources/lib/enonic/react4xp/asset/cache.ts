import type {
	Request,
	Response
} from '../../../..';


import {includes} from '@enonic/js-utils/array/includes';
import {cleanAnyDoubleQuoteWrap} from '@enonic/js-utils/string/cleanAnyDoubleQuoteWrap';
//import {toStr} from '@enonic/js-utils/value/toStr';
//@ts-ignore
import {newCache} from '/lib/cache';
import {eTagGetter} from './eTagGetter';
import {getImmuteables} from './getImmuteables';
import {getEntries} from './getEntries';
import {immuteableGetter} from './immuteableGetter';


const ENTRIES = getEntries();
//log.debug('handleAssetRequest ENTRIES:%s', toStr(ENTRIES));
const IMMUTEABLES = getImmuteables(ENTRIES);
//log.debug('handleAssetRequest IMMUTEABLES:%s', toStr(IMMUTEABLES));


const assetResponseCache = newCache({
	size: 300,
	expire: 60*60*24*365 // 1 year
});


const eTagCache = newCache({
	size: 300,
	expire: 60 // 1 minute
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
	return eTagCache.get(assetPath, () => {
		const response = eTagGetter({
			rawPath: assetPath
		});
		const {
			headers: {
				ETag // Starts and ends with double quotes
			}
		} = response;
		const cleanedETag = cleanAnyDoubleQuoteWrap(ETag);
		//log.debug('getCachedETag() caching assetPath:%s to ETag:%s', assetPath, ETag);
		return cleanedETag;
	}) as string;
} // getCachedETag


export function getCachedAssetResponse(request :Request<{ETag? :string}>) {
	const {
		contextPath,
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
	if (cleanPath.startsWith('/')) {
		cleanPath = cleanPath.substring(1);
	}

	if (ETag) {
		const cacheKey = `${cleanPath}?ETag=${ETag}`;
		const cachedResponse = assetResponseCache.get(cacheKey, () => {
			//log.debug('getCachedAssetResponse() caching cacheKey:%s to response', cacheKey);
			return immuteableGetter(request);
		}) as Response;
		return cachedResponse;
	}

	if (IMMUTEABLES[cleanPath]) {
		return immuteableGetter(request);
	}

	if (!includes(ENTRIES, cleanPath)) {
		log.debug('handleAssetRequest() unable to determine whether immuteable falling back to eTagGetter cleanPath:%s', cleanPath);
	}

	return eTagGetter(request); // Handles ifNoneMatch requests?
}
