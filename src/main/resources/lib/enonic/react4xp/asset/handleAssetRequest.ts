import type {
	Request,
	Response
} from '../../../..';


import {includes} from '@enonic/js-utils/array/includes';
import {toStr} from '@enonic/js-utils/value/toStr';
//import {getClientUrls} from '/lib/enonic/react4xp/dependencies';

import {eTagGetter} from './eTagGetter';
import {getImmuteables} from './getImmuteables';
import {getEntries} from './getEntries';
import {immuteableGetter} from './immuteableGetter';
import {noStoreGetter} from './noStoreGetter';
import {IS_DEV_MODE} from '/lib/enonic/xp/runMode';


const ENTRIES = getEntries();
//log.debug('handleAssetRequest ENTRIES:%s', toStr(ENTRIES));
const IMMUTEABLES = getImmuteables(ENTRIES);
//log.debug('handleAssetRequest IMMUTEABLES:%s', toStr(IMMUTEABLES));


export function handleAssetRequest(request :Request<{ETag? :string}>) :Response {
	//log.debug('handleAssetRequest() request:%s', toStr(request));

	if (IS_DEV_MODE) {
		return noStoreGetter(request);
	}
	//const clientUrls = getClientUrls();
	//log.debug('handleAssetRequest() clientUrls:%s', toStr(clientUrls));
	// /admin/site/preview/default/draft/react4xp-site/_/service/com.enonic.app.react4xp/react4xp-client/

	const {
		contextPath,
		params: {
			ETag
		} = {},
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

	if (includes(ENTRIES, cleanPath)) {
		if (ETag) {
			return immuteableGetter(request);
		}
		return eTagGetter(request);
	}

	log.debug('handleAssetRequest() unable to determine whether immuteable falling back to eTagGetter cleanPath:%s', toStr(cleanPath));
	return eTagGetter(request);
} // handleAssetRequest
