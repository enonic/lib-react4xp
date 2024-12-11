import {R4X_TARGETSUBDIR} from '@enonic/react4xp/constants.runtime';
import {requestHandler} from '/lib/enonic/static';


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
//
//
// https://stackoverflow.com/questions/18148884/difference-between-no-cache-and-must-revalidate
//
// max-age=0, must-revalidate and no-cache aren't exactly identical.
// With must-revalidate, if the server doesn't respond to a revalidation
// request, the browser/proxy is supposed to return a 504 error. With no-cache,
// it would just show the cached content, which would be probably preferred by
// the user (better to have something stale than nothing at all).
// This is why must-revalidate is intended for critical transactions only.
export const eTagGetter = (request) => requestHandler(request, {
	cacheControl: () => 'no-cache', // implies must-revalidate after 0 seconds
	//cacheControl: 'max-age=0, must-revalidate'
	//cacheControl: 'max-age=604800, stale-while-revalidate=86400'
	etag: true, // default is true in production and false in development
	relativePath: (request) => {
		const prefix = request.contextPath;
		return prefix ? request.rawPath.substring(prefix.length) : request.rawPath;
	},
	root: R4X_TARGETSUBDIR // r4xAssets
});
