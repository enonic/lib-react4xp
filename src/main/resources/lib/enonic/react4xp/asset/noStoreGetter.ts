import type {
	Request,
	Response
} from '../../../..';

import {R4X_TARGETSUBDIR} from '@enonic/react4xp';
// @ts-ignore
import {requestHandler} from '/lib/enonic/static';

// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control
//
// no-store
//  The no-store response directive indicates that any caches of any kind
// (private or shared) should not store this response.
//
// no-cache
//  The no-cache request directive asks caches to validate the response with the
//  origin server before reuse. no-cache allows clients to request the most
//  up-to-date response even if the cache has a fresh response.
//
// max-age
//  The max-age=N request directive indicates that the client allows a stored
//  response that is generated on the origin server within N seconds — where N
//  may be any non-negative integer (including 0). max-age=0 is a workaround for
//  no-cache, because many old (HTTP/1.0) cache implementations don't support
//  no-cache. Recently browsers are still using max-age=0 in "reloading" — for
//  backward compatibility — and alternatively using no-cache to cause a
// "force reloading".
//
// must-revalidate
//  The must-revalidate response directive indicates that the response can be
//  stored in caches and can be reused while fresh. If the response becomes
//  stale, it must be validated with the origin server before reuse.

export const noStoreGetter = (request: Request): Response => requestHandler(request, {
	cacheControl: () => 'no-store, no-cache, max-age=0',
	etag: false,
	relativePath: (request) => {
		const prefix = request.contextPath;
		return prefix ? request.rawPath.substring(prefix.length) : request.rawPath;
	},
	root: R4X_TARGETSUBDIR // r4xAssets
});
