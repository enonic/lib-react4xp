/** Service that always delivers the out-of-the-box frontend client */
import type {
	//Request,
	Response
} from '../..';

import {LIBRARY_NAME} from '@enonic/react4xp';
//import {toStr} from '@enonic/js-utils/value/toStr';
//@ts-ignore
import {getResource} from '/lib/xp/io';

import { getReact4xpEntry } from '/lib/enonic/react4xp/clientCacheResources';
import { getServiceRoot } from '/lib/enonic/react4xp/serviceRoots';
import {IS_DEV_MODE} from '/lib/enonic/xp/runMode';


let RESPONSE :Response;
export function get(/*req :Request*/) :Response {
	if (IS_DEV_MODE) {
		RESPONSE = undefined;
	}
    if (RESPONSE === undefined) {
        try {
            // TODO: ADD SUPPORT FOR BUILT-AND-HASHED CHUNK, NOT JUST THE FALLBACK!
            const resource = getResource('/services/react4xp-client/react4xpClient.js');
            if (!resource || !resource.exists()) {
                throw Error(`File not found: /services/react4xp-client/react4xpClient.js`);
            }

            RESPONSE = getReact4xpEntry(resource);

            //log.info("RESPONSE (" + typeof RESPONSE + "): " + JSON.stringify(RESPONSE, null, 2));

            // Placeholders defined in build.gradle. Keep up to date!
            RESPONSE.body = RESPONSE.body
                .replace(/__REACT4XP__RUNTIME__CLIENT__LIBRARY_NAME__PLACEHOLDER__/g, LIBRARY_NAME)
                .replace(/__REACT4XP__RUNTIME__CLIENT__SERVICE_ROOT_URL__PLACEHOLDER__\//g, getServiceRoot());

            // FIXME: ETAG not working, using standard client cache instead, limited to 1 hour since it's not hashed
            RESPONSE.headers = {
                'Content-Type': 'application/javascript;charset=utf-8',
                'Cache-Control': IS_DEV_MODE ? 'no-store, no-cache, max-age=0' : 'public, max-age=3600'
            };

        } catch (e) {
            log.error(e);
            RESPONSE = undefined;
            throw e;
        }
    }
    return RESPONSE;
};
