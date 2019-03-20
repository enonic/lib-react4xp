/** Service that always delivers the out-of-the-box frontend client */
var ioLib = require('/lib/xp/io');
var { getReact4xpEntry } = require('/lib/enonic/react4xp/clientCacheResources');
const { insertAppName } = require('/lib/enonic/react4xp/utils');


let RESPONSE = null;

exports.get = (req) => {
    if (!RESPONSE) {
        try {
            log.info("Init service react4xp-client");

            // TODO: ADD SUPPORT FOR BUILT-AND-HASHED CHUNK, NOT JUST THE FALLBACK!
            const resource = ioLib.getResource('/services/react4xp-client/react4xpClient.js');
            if (!resource || !resource.exists()) {
                throw Error(`File not found: /services/react4xp-client/react4xpClient.js`);
            }

            RESPONSE = getReact4xpEntry(resource);

            log.info("RESPONSE (" + typeof RESPONSE + "): " + JSON.stringify(RESPONSE, null, 2));


            // react4xp_constants.json is not part of lib-react4xp-runtime,
            // it's an external shared-constants file expected to exist in the react4xp lib build directory.
            // Easiest: the NPM package react4xp-buildconstants creates this file and copies it here.
            const {
                LIBRARY_NAME, SERVICE_ROOT_URL
            } = require('/lib/enonic/react4xp/react4xp_constants.json');

            log.info("SERVICE_ROOT_URL (" + typeof SERVICE_ROOT_URL + "): " + JSON.stringify(SERVICE_ROOT_URL, null, 2));

            // Placeholders defined in build.gradle. Keep up to date!
            RESPONSE.body = RESPONSE.body
                .replace(/__REACT4XP__RUNTIME__CLIENT__LIBRARY_NAME__PLACEHOLDER__/g, LIBRARY_NAME)
                .replace(/__REACT4XP__RUNTIME__CLIENT__SERVICE_ROOT_URL__PLACEHOLDER__\//g, insertAppName(SERVICE_ROOT_URL));

        } catch (e) {
            log.error(e);
            return {
                contentType: 'text/plain',
                status: 500,
                body: 'Failed to resolve the react4xp client wrapper. See server log for details.'
            }
        }
    }
    return RESPONSE;
};
