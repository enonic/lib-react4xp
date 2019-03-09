
var ioLib = require('/lib/xp/io');
var utilLib = require('/lib/enonic/util');
var react4xpUtilsLib = require('/lib/enonic/react4xp/utils');
var cacheLib = require('/lib/cache');


// react4xp_constants.json is not part of lib-react4xp-runtime,
// it's an external shared-constants file expected to exist in the react4xp lib build directory.
// Easiest: the NPM package react4xp-buildconstants creates this file and copies it here.
const {
    R4X_TARGETSUBDIR, ASSET_URL_ROOT, ENTRIES_FILENAME
} = require('/lib/enonic/react4xp/react4xp_constants.json');

exports.get = (req) => {
    return "react4xp-client!";
};
