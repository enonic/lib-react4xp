import type {
	Request,
	Response
} from '../../../..';


//import {includes} from '@enonic/js-utils/array/includes';
import {toStr} from '@enonic/js-utils/value/toStr';

//import {eTagGetter} from './eTagGetter';
import {getImmuteables} from './getImmuteables';
import {getEntries} from './getEntries';
import {immuteableGetter} from './immuteableGetter';
//import {noStoreGetter} from './noStoreGetter';
//import {IS_DEV_MODE} from '/lib/enonic/xp/runMode';


const ENTRIES = getEntries();
//log.debug('handleAssetRequest ENTRIES:%s', toStr(ENTRIES));
const IMMUTEABLES = getImmuteables(ENTRIES);
//log.debug('handleAssetRequest IMMUTEABLES:%s', toStr(IMMUTEABLES));


export function handleAssetRequest(request :Request<{ETag? :string}>) :Response {
	//log.debug('handleAssetRequest() request:%s', toStr(request));

	/*if (IS_DEV_MODE) {
		return noStoreGetter(request);
	}*/

	const {
		contextPath,
		/*params: {
			ETag
		} = {},*/
		rawPath
	} = request;
	let cleanPath = rawPath.substring(contextPath.length);
	if (cleanPath.startsWith('/')) {
		cleanPath = cleanPath.substring(1);
	}
	//log.debug('handleAssetRequest() cleanPath:%s', toStr(cleanPath));

	if (IMMUTEABLES[cleanPath]) {
		return immuteableGetter(request);
	}

	log.debug('handleAssetRequest() this should not happen! cleanPath:%s', toStr(cleanPath));
	return { status: 404 };

	/*if (includes(ENTRIES, cleanPath)) {
		log.debug('handleAssetRequest() an entry cleanPath:%s', toStr(cleanPath));
		/*if (ETag) {
			return immuteableGetter(request);
		}*
		return eTagGetter(request);
	}

	log.debug('handleAssetRequest() unable to determine whether immuteable falling back to eTagGetter cleanPath:%s', toStr(cleanPath));
	return eTagGetter(request);*/
} // handleAssetRequest
