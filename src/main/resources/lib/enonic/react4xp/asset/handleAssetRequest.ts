import type {
	Request,
	Response
} from '../../../..';


import {includes} from '@enonic/js-utils/array/includes';
import {toStr} from '@enonic/js-utils/value/toStr';
import {
	//getClientUrls,
	getExternalsUrls
} from '/lib/enonic/react4xp/dependencies';

import {eTagGetter} from './eTagGetter';
import {getEntries} from './getEntries';
import {getDependencies} from './getDependencies';
import {immuteableGetter} from './immuteableGetter';


const ENTRIES = getEntries();
//log.debug('handleAssetRequest ENTRIES:%s', toStr(ENTRIES));
const dependencies = getDependencies(ENTRIES);
const dependencyChunks = {};
for (let i = 0; i < dependencies.length; i++) {
    const dependency = dependencies[i];
	dependencyChunks[dependency] = true;
}
//log.debug('handleAssetRequest dependencyChunks:%s', toStr(dependencyChunks));


export function handleAssetRequest(request :Request<{ETag? :string}>) :Response {
	//log.debug('handleAssetRequest() request:%s', toStr(request));

	const externalsUrls = getExternalsUrls();
	//log.debug('handleAssetRequest() externalsUrls:%s', toStr(externalsUrls));
	// /admin/site/preview/default/draft/react4xp-site/_/service/com.enonic.app.react4xp/react4xp/externals.7b3f9703b.js

	//const clientUrls = getClientUrls();
	//log.debug('handleAssetRequest() clientUrls:%s', toStr(clientUrls));
	// /admin/site/preview/default/draft/react4xp-site/_/service/com.enonic.app.react4xp/react4xp-client/

	const {
		contextPath,
		params: {
			ETag
		} = {},
		path,
		rawPath
	} = request;
	let cleanPath = rawPath.substring(contextPath.length);
	if (cleanPath.startsWith('/')) {
		cleanPath = cleanPath.substring(1);
	}
	//log.debug('handleAssetRequest() cleanPath:%s', toStr(cleanPath));

	if (includes(externalsUrls, path)) {
		return immuteableGetter(request);
	}

	if (includes(ENTRIES, cleanPath)) {
		if (ETag) {
			return immuteableGetter(request);
		}
		return eTagGetter(request);
	}

	if (dependencyChunks[cleanPath]) {
		return immuteableGetter(request);
	}

	log.debug('handleAssetRequest() unable to determine whether entry, externals or dependencyChunk, falling back to eTagGetter cleanPath:%s', toStr(cleanPath));
	return eTagGetter(request);
} // handleAssetRequest
