import type {Request} from '../../../..';


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


export function getETag(assetPath :string) {
	const response :Response = getter({
		rawPath: assetPath
	});
	const {
		headers: {
			ETag // Starts and ends with double quotes
		}
	} = response;
	//log.debug('buildAssetUrl() ETag:%s', toStr(ETag));
	return cleanAnyDoubleQuoteWrap(ETag);
}
