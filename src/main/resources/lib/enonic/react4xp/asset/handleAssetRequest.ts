import type {
	Request,
	Response
} from '../../../..';


import {includes} from '@enonic/js-utils/array/includes';
import {toStr} from '@enonic/js-utils/value/toStr';
//import {getClientUrls} from '/lib/enonic/react4xp/dependencies';

import {eTagGetter} from './eTagGetter';
import {getDependencies} from './getDependencies';
import {getEntries} from './getEntries';
import {getExternals} from './getExternals';
import {immuteableGetter} from './immuteableGetter';


const ENTRIES = getEntries();
//log.debug('handleAssetRequest ENTRIES:%s', toStr(ENTRIES));
const dependencies = getDependencies(ENTRIES);
const externals = getExternals();
//log.debug('handleAssetRequest externals:%s', toStr(externals));

const IMMUTEABLES = {};
for (let i = 0; i < dependencies.length; i++) {
	const dependency = dependencies[i];
	IMMUTEABLES[dependency] = true;
}
for (let i = 0; i < externals.length; i++) {
	const external = externals[i];
	IMMUTEABLES[external] = true;
}
//log.debug('handleAssetRequest IMMUTEABLES:%s', toStr(IMMUTEABLES));


export function handleAssetRequest(request :Request<{ETag? :string}>) :Response {
	//log.debug('handleAssetRequest() request:%s', toStr(request));

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
