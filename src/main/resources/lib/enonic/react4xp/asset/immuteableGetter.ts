import type {
	Request,
	Response
} from '../../../..';


import {R4X_TARGETSUBDIR} from '@enonic/react4xp';
//@ts-ignore
import {buildGetter} from '/lib/enonic/static';


export const immuteableGetter = buildGetter({
	etag: false, // default is true in production and false in development
	getCleanPath: (request :Request) => {
		const prefix = request.contextPath;
		return prefix ? request.rawPath.substring(prefix.length) : request.rawPath;
	},
	root: R4X_TARGETSUBDIR // assets/react4xp
}) as (request: Request) => Response;
