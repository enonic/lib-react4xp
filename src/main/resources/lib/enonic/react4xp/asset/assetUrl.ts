//import {toStr} from '@enonic/js-utils/value/toStr';
import {
	//getSite,
	//pageUrl,
	serviceUrl as getServiceUrl
	//@ts-ignore
} from '/lib/xp/portal';

type UrlTypeServer = 'server'
type UrlTypeRelative = 'relative'
type UrlType = UrlTypeServer | UrlTypeRelative;


const URL_TYPE_SERVER :UrlTypeServer = 'server';


// http://localhost:8080/admin/site/inline/default/draft/react4xp-site/_/service/com.enonic.app.react4xp/react4xp/site/parts/color/color.js
//     siteUrl: http://localhost:8080/admin/site/inline/default/draft/react4xp-site
//              /
// serviceRoot: _/service
//              /
// application: com.enonic.app.react4xp
//              /
//   assetRoot: react4xp
//              /
//   assetPath: site/parts/color/color.js
export function assetUrl<
	Params extends object = {}
>(functionParams :{
	assetPath :string
	// Optional
	application? :string
	serviceName? :string
	serviceUrl? :string
	/*site? :{
		_id: string
	}
	siteId? :string
	siteUrl? :string*/
	type? :UrlType
	urlParams? :Params
}) {
	const {
		assetPath,
		// Optional
		application = app.name,
		serviceName = 'react4xp',
		type = URL_TYPE_SERVER,
		urlParams = {}
	} = functionParams;
	if (!assetPath) {
		throw new Error(`assetUrl: Missing required parameter assetPath!`);
	}
	let {
		serviceUrl/*,
		site,
		siteId,
		siteUrl*/
	} = functionParams;
	/*if (!siteUrl) {
		if (!siteId) {
			if (!site) {
				site = getSite();
				if (!site) {
					throw new Error(`assetUrl: getSite() did not return a site!`);
				}
			}
			siteId = site._id;
		}
		if (!siteId) {
			throw new Error(`assetUrl: Unable to determine siteId!`);
		}
		siteUrl = pageUrl({id: siteId});
		if (!siteUrl) {
			throw new Error(`assetUrl: Unable to determine siteUrl!`);
		}
	}*/
	if (!serviceUrl) {
		if (!serviceName) {
			throw new Error(`assetUrl: You have to provide serviceUrl or serviceName!`);
		}
		serviceUrl = getServiceUrl({
			application,
			params: urlParams,
			service: serviceName,
			type
		});
	}
	if (!serviceUrl) {
		throw new Error(`assetUrl: Unable to determine serviceUrl from application:${application} serviceName:${serviceName} type:${type}!`);
	}
	return `${serviceUrl}/${assetPath}`.replace(/\/{2,}/g, '/');
} // assetUrl
