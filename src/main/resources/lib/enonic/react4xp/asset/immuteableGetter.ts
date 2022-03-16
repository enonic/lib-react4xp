import type {
	Request,
	Response
} from '../../../..';

//@ts-ignore
import {R4X_TARGETSUBDIR} from '/lib/enonic/react4xp/react4xp_constants.json'; // assets/react4xp
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
