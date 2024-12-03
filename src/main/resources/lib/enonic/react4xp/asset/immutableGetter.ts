import {R4X_TARGETSUBDIR} from '@enonic/react4xp/constants.runtime';
import {requestHandler} from '/lib/enonic/static';


export const immutableGetter = (request) => requestHandler(request,{
	etag: false, // default is true in production and false in development
	relativePath: (request) => {
		const prefix = request.contextPath;
		return prefix ? request.rawPath.substring(prefix.length) : request.rawPath;
	},
	root: R4X_TARGETSUBDIR // r4xAssets
});
