import type {Request, Response} from '@enonic-types/core';
import {startsWith} from '@enonic/js-utils/string/startsWith';
// import {toStr} from '@enonic/js-utils/value/toStr';
import {eTagGetter} from '/lib/enonic/react4xp/asset/eTagGetter';
import {getImmutables} from '/lib/enonic/react4xp/asset/getImmutables';
import {getEntries} from '/lib/enonic/react4xp/asset/getEntries';
import {immutableGetter} from '/lib/enonic/react4xp/asset/immutableGetter';
//import {noStoreGetter} from './noStoreGetter';
//import {IS_DEV_MODE} from '/lib/enonic/react4xp/xp/appHelper';


const ENTRIES = getEntries(); // Never contains contenthash
// log.debug('handleAssetRequest ENTRIES:%s', toStr(ENTRIES));

const IMMUTABLES = getImmutables(ENTRIES);
// log.debug('handleAssetRequest IMMUTABLES:%s', toStr(IMMUTABLES));


export function handleAssetRequest(request: Request): Response {
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

	if (IMMUTABLES[cleanPath]) {
		return immutableGetter(request);
	}

	// returns 304 Not Modified if headers['If-None-Match'] matches the asset's cached ETag.
	return eTagGetter(request);
} // handleAssetRequest
