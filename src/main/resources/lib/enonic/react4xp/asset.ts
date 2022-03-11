import type {
	Request,
	Response
} from '../../..';


import {cleanAnyDoubleQuoteWrap} from '@enonic/js-utils/string/cleanAnyDoubleQuoteWrap';
//import {toStr} from '@enonic/js-utils/value/toStr';
//@ts-ignore
import {R4X_TARGETSUBDIR} from '/lib/enonic/react4xp/react4xp_constants.json';
//@ts-ignore
import {buildGetter} from '/lib/enonic/static';


const getter = buildGetter({
	getCleanPath: (request :Request) => {
        const prefix = request.contextPath;
		return prefix ? request.rawPath.substring(prefix.length) : request.rawPath;
    },
	etag: true, // default is true in production and false in development
	root: R4X_TARGETSUBDIR
});


export function buildAssetUrl({
	assetPath
} :{
	assetPath :string
}) :string {
	//log.debug('buildAssetUrl() assetPath:%s', toStr(assetPath));
	const response :Response = getter({
		rawPath: assetPath
	});
	//log.debug('buildAssetUrl() response:%s', toStr(response));
	const {
		//contentType,
		headers: {
			//'Cache-Control',
			ETag // Starts and ends with double quotes
		},
		//status
	} = response;
	//log.debug('buildAssetUrl() ETag:%s', toStr(ETag));
	const cleanedETag = cleanAnyDoubleQuoteWrap(ETag);
	//log.debug('buildAssetUrl() cleanedETag:%s', toStr(cleanedETag));
	//return `${R4X_TARGETSUBDIR}/${assetPath.replace(/\.([^/.]+)$/, `.${cleanedETag}.$1`)}`;
	return `${assetPath.replace(/\.([^/.]+)$/, `.${cleanedETag}.$1`)}`;
}


export function handleAssetRequest(request :Request) :Response {
	//log.debug('handleAssetRequest() request:%s', toStr(request)); // Contains contextPath and rawPath :)
	const {
		//contextPath,
		rawPath
	} = request;

	//const cleanedPath = rawPath.substring(contextPath.length);
	//log.debug('handleAssetRequest() cleanedPath:%s', toStr(cleanedPath));

	const pathParts = rawPath.split('.');
	const extention = pathParts.pop();
	//const ETagFromFilename =
	pathParts.pop();
	//log.debug('handleAssetRequest() ETagFromFilename:%s', toStr(ETagFromFilename));
	pathParts.push(extention);
	const rawPathWithoutETag = pathParts.join('.');
	//log.debug('handleAssetRequest() rawPathWithoutETag:%s', toStr(rawPathWithoutETag));
	request.rawPath = rawPathWithoutETag;

	const response :Response = getter(request);
	delete response.headers.ETag;
	return response;
}
