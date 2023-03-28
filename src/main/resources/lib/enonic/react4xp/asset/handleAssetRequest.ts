import type {
	Request,
	Response
} from '../../../..';
import {startsWith} from '@enonic/js-utils/string/startsWith';
// import {toStr} from '@enonic/js-utils/value/toStr';
import {eTagGetter} from './eTagGetter';
import {getImmuteables} from './getImmuteables';
import {getEntries} from './getEntries';
import {immuteableGetter} from './immuteableGetter';
//import {noStoreGetter} from './noStoreGetter';
//import {IS_DEV_MODE} from '/lib/enonic/xp/runMode';


const ENTRIES = getEntries(); // Never contains contenthash
// log.debug('handleAssetRequest ENTRIES:%s', toStr(ENTRIES));

const IMMUTEABLES = getImmuteables(ENTRIES);
// log.debug('handleAssetRequest IMMUTEABLES:%s', toStr(IMMUTEABLES));


export function handleAssetRequest(request: Request<{ETag?: string}>): Response {
	//log.debug('handleAssetRequest() request:%s', toStr(request));

	/*if (IS_DEV_MODE) {
		return noStoreGetter(request);
	}*/

	const {
		contextPath,
		rawPath
	} = request;
	let cleanPath = rawPath.substring(contextPath.length);
	if (startsWith(cleanPath, '/')) {
		cleanPath = cleanPath.substring(1);
	}
	//log.debug('handleAssetRequest() cleanPath:%s', toStr(cleanPath));

	if (IMMUTEABLES[cleanPath]) {
		return immuteableGetter(request);
	}

	// returns 304 Not Modified if headers['If-None-Match'] matches the asset's cached ETag.
	return eTagGetter(request);
} // handleAssetRequest
