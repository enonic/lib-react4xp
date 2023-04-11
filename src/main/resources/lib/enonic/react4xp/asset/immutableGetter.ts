import type {
	Request,
	Response
} from '../../../..';


import {R4X_TARGETSUBDIR} from '@enonic/react4xp';
//@ts-ignore
import {buildGetter} from '/lib/enonic/static';


export const immutableGetter = buildGetter({
	etag: false, // default is true in production and false in development
	getCleanPath: (request :Request) => {
		const prefix = request.contextPath;
		return prefix ? request.rawPath.substring(prefix.length) : request.rawPath;
	},
	root: R4X_TARGETSUBDIR // r4xAssets
}) as (request: Request) => Response;
