import type {
	Request,
	Response
} from '../../../..';


import {includes} from '@enonic/js-utils/array/includes';
import {toStr} from '@enonic/js-utils/value/toStr';
import {
	COMPONENT_STATS_FILENAME,
	ENTRIES_FILENAME,
	R4X_TARGETSUBDIR
	//@ts-ignore
} from '/lib/enonic/react4xp/react4xp_constants.json'; // assets/react4xp
import {
	//getClientUrls,
	getExternalsUrls
} from '/lib/enonic/react4xp/dependencies';
//@ts-ignore
import {buildGetter} from '/lib/enonic/static';
import {
	getResource,
	readLines
	//@ts-ignore
} from '/lib/xp/io';


const REACT4XP_ROOT = `/${R4X_TARGETSUBDIR}/`;

const ENTRIES = (JSON.parse(
    readLines(getResource(REACT4XP_ROOT + ENTRIES_FILENAME).getStream())
        .join(" ")
) as Array<string>).map(entry => `${entry}.js`);
//log.debug('handleAssetRequest ENTRIES:%s', toStr(ENTRIES));

const COMPONENT_STATS = JSON.parse(
    readLines(getResource(REACT4XP_ROOT + COMPONENT_STATS_FILENAME).getStream())
        .join(" ")
);
//log.debug('handleAssetRequest COMPONENT_STATS:%s', toStr(COMPONENT_STATS));
const dependencyChunks = {};
const entryNames = Object.keys(COMPONENT_STATS.entrypoints);
for (let i = 0; i < entryNames.length; i++) {
    const entryName = entryNames[i];
	const assets = COMPONENT_STATS.entrypoints[entryName].assets;
	//log.debug('handleAssetRequest assets:%s', toStr(assets));
	for (let j = 0; j < assets.length; j++) {
	    const asset = assets[j];
		//log.debug('handleAssetRequest asset:%s', toStr(asset));
		const {name: assetName} = asset;
		//log.debug('handleAssetRequest assetName:%s', toStr(assetName));
		if (!includes(ENTRIES, assetName)) {
			dependencyChunks[assetName] = true;
		}
	}
}
//log.debug('handleAssetRequest dependencyChunks:%s', toStr(dependencyChunks));

// https://simonhearne.com/2022/caching-header-best-practices
//
// In general we want browsers to cache everything forever. This can be achieved
// quite simply by setting a Cache-Control: max-age=31536000 response header -
// using the maximum TTL value of one year.
//
// Allowing an HTML asset to be cached for a short period can improve user
// experience with minimal risk. Setting a TTL of five minutes (300s) for
// example should be fine, you can also add:
//
// must-revalidate
//  to ensure that browsers do not use a stale version of the asset after the
//  TTL has expired. This will benefit visitors who click links returning them
//  to previously visited pages, this does not affect the back/forward cache
//
// stale-while-revalidate
//  causes the revalidation request to happen asynchronously, improving
//  performance at the potential risk of using stale content with a second time
//  to live (TTL) value for how long the stale asset may be used.
const eTagGetter = buildGetter({
	cacheControl: 'no-cache',
	//cacheControl: 'max-age=0, must-revalidate'
	//cacheControl: 'max-age=604800, stale-while-revalidate=86400'
	etag: true, // default is true in production and false in development
	root: R4X_TARGETSUBDIR // assets/react4xp
});

const immuteableGetter = buildGetter({
	etag: false, // default is true in production and false in development
	root: R4X_TARGETSUBDIR // assets/react4xp
});


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

	log.debug('handleAssetRequest() unable to determine whether entry, externals or dependencyChunk cleanPath:%s', toStr(cleanPath));
	return eTagGetter(request);
} // handleAssetRequest
