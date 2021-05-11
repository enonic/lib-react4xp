/** Service that always delivers the out-of-the-box frontend client */
var ioLib = require('/lib/xp/io');
import { getReact4xpEntry } from '/lib/enonic/react4xp/clientCacheResources';
import { getServiceRoot } from '/lib/enonic/react4xp/serviceRoots';

let RESPONSE;
exports.get = (req) => {
    if (RESPONSE === undefined) {
        try {
            // TODO: ADD SUPPORT FOR BUILT-AND-HASHED CHUNK, NOT JUST THE FALLBACK!
            const resource = ioLib.getResource('/services/react4xp-client/react4xpClient.js');
            if (!resource || !resource.exists()) {
                throw Error(`File not found: /services/react4xp-client/react4xpClient.js`);
            }

            RESPONSE = getReact4xpEntry(resource);

            //log.info("RESPONSE (" + typeof RESPONSE + "): " + JSON.stringify(RESPONSE, null, 2));


            // react4xp_constants.json is not part of lib-react4xp-runtime,
            // it's an external shared-constants file expected to exist in the react4xp lib build directory.
            // Easiest: the NPM package react4xp-buildconstants creates this file and copies it here.
            const { LIBRARY_NAME } = require('/lib/enonic/react4xp/react4xp_constants.json');
            // TODO: The above (require) doesn't sem to handle re-reading updated files in XP dev runmode. Is that necessary? If so, use XP resource approach instead!

            // Placeholders defined in build.gradle. Keep up to date!
            RESPONSE.body = RESPONSE.body
                .replace(/__REACT4XP__RUNTIME__CLIENT__LIBRARY_NAME__PLACEHOLDER__/g, LIBRARY_NAME)
                .replace(/__REACT4XP__RUNTIME__CLIENT__SERVICE_ROOT_URL__PLACEHOLDER__\//g, getServiceRoot());

            // FIXME: ETAG not working, using standard client cache instead, limited to 1 hour since it's not hashed
            RESPONSE.headers = {
                'Content-Type': 'application/javascript;charset=utf-8',
                'Cache-Control': 'public, max-age=3600'
            };

        } catch (e) {
            log.error(e);
            RESPONSE = undefined;
            throw e;
        }
    }
    return RESPONSE;
};
