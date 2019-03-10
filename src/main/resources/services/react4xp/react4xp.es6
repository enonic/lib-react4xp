// React4xp static-asset file server, with specified cache control headers

var ioLib = require('/lib/xp/io');
var { getAssetRoot } = require('/lib/enonic/react4xp/utils');
var { getReact4xpEntry, getReact4xpHashedChunk } = require('/lib/enonic/react4xp/clientCacheResources');
var cacheLib = require('/lib/cache');

// react4xp_constants.json is not part of lib-react4xp-runtime,
// it's an external shared-constants file expected to exist in the react4xp lib build directory.
// Easiest: the NPM package react4xp-buildconstants creates this file and copies it here.
const {
    R4X_TARGETSUBDIR, ASSET_URL_ROOT, ENTRIES_FILENAME
} = require('/lib/enonic/react4xp/react4xp_constants.json');


const SERVICE_ROOT = getAssetRoot(ASSET_URL_ROOT);


log.info("SERVICE_ROOT: " + JSON.stringify(SERVICE_ROOT, null, 2));

const REACT4XP_ROOT = `/${R4X_TARGETSUBDIR}/`;


const componentsCache = cacheLib.newCache({
    size: 100,
    expire: 108000 // 30 hours
});


const ENTRIES = JSON.parse(
    ioLib.readLines(
        ioLib.getResource(REACT4XP_ROOT + ENTRIES_FILENAME).getStream()
    ).join(" ")
).map(entry => `${entry}.js`);



// Handle all GET requests
exports.get = function (req) {
    if ((req.path || "").startsWith(SERVICE_ROOT)) {
        let target = (req.path.substring(SERVICE_ROOT.length) || "").trim();
        if (!target) {
            return {
                status: 400,
            }
        }

        log.info("React4xp target: " + JSON.stringify(target, null, 2));

        let resource = ioLib.getResource(REACT4XP_ROOT + target);
        if (!resource || !resource.exists()) {
            resource = ioLib.getResource(REACT4XP_ROOT + target + '.js');

            if (!resource || !resource.exists()) {
                log.warning(`File not found: ${REACT4XP_ROOT + target}`);
                return {
                    status: 404,
                }

            } else {
                target += ".js";
            }

        }

        if (ENTRIES.indexOf(target) === -1) {
            return componentsCache.get(target, function() {
                log.info("Caching React4XP component: " + target);
                return getReact4xpHashedChunk(resource);
            });

        } else {
            return componentsCache.get(target, function() {
                log.info("Caching React4XP entry: " + target);
                return getReact4xpEntry(resource);
            });
        }


    } else {
        return {
            status: 400,
        }
    }
};
