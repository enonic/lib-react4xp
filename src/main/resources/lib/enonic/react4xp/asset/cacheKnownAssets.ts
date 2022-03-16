import {
	clearAssetResponseCache,
	clearETagCache,
	getCachedAssetResponse,
	getCachedETag
} from './cache';
import {getEntries} from './getEntries';
//import {getImmuteables} from './getImmuteables';


const ENTRIES = getEntries();
//const IMMUTEABLES = getImmuteables(ENTRIES);


export function cacheKnownAssets() {
	clearAssetResponseCache();
	clearETagCache();
	for (let i = 0; i < ENTRIES.length; i++) {
	    const entry = ENTRIES[i];
		const ETag = getCachedETag(entry);
		log.debug('cacheKnownAssets(): Caching entry:%s ETag:%s', entry, ETag);
		getCachedAssetResponse({
			params: {
				ETag
			},
			rawPath: entry
		});
	} // for ENTRIES
} // cacheKnownAssets
