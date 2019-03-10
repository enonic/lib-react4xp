var ioLib = require('/lib/xp/io');
var { getReact4xpEntry } = require('/lib/enonic/react4xp/clientCacheResources');


// react4xp_constants.json is not part of lib-react4xp-runtime,
// it's an external shared-constants file expected to exist in the react4xp lib build directory.
// Easiest: the NPM package react4xp-buildconstants creates this file and copies it here.
const {
    LIBRARY_NAME
} = require('/lib/enonic/react4xp/react4xp_constants.json');

let RESPONSE = null;

exports.get = (req) => {
    if (!RESPONSE) {
        log.info("Init service react4xp-client");

        const resource = ioLib.getResource('/services/react4xp-client/react4xpClient.js');
        if (!resource || !resource.exists()) {
            throw Error(`File not found: /services/react4xp-client/react4xpClient.js`);
        }

        const RESPONSE = getReact4xpEntry(resource);

        // Placeholder defined in build.gradle. Keep up to date!
        RESPONSE.body = RESPONSE.body.replace(/__REACT4XP__RUNTIME__CLIENT__LIBRARY__NAME__PLACEHOLDER__/g, LIBRARY_NAME);
        return RESPONSE;
    }
    return RESPONSE;
};

