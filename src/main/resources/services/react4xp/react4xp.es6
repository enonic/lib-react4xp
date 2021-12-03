// React4xp static-asset file server, with specified cache control headers

const ioLib = require("/lib/xp/io");
const cacheLib = require("/lib/cache");
const {
    getReact4xpEntry,
    getReact4xpHashedChunk
} = require("/lib/enonic/react4xp/clientCacheResources");
const {getSuffix} = require("/lib/enonic/react4xp/serviceRoots");

// react4xp_constants.json is not part of lib-react4xp-runtime,
// it's an external shared-constants file expected to exist in the react4xp lib build directory.
// Easiest: the NPM package react4xp-buildconstants creates this file and copies it here.
const {
    R4X_TARGETSUBDIR,
    ENTRIES_FILENAME
} = require("/lib/enonic/react4xp/react4xp_constants.json");
const {getSiteLocalCacheKey} = require("/lib/enonic/react4xp/dependencies");
// TODO: The above (require) doesn't sem to handle re-reading updated files in XP dev runmode. Is that necessary? If so, use dependencies.readResourceAsJson instead!

const REACT4XP_ROOT = `/${R4X_TARGETSUBDIR}/`;

const componentsCache = cacheLib.newCache({
    size: 300,
    expire: 108000 // 30 hours
});

const ENTRIES = JSON.parse(
    ioLib
        .readLines(ioLib.getResource(REACT4XP_ROOT + ENTRIES_FILENAME).getStream())
        .join(" ")
).map(entry => `${entry}.js`);

// Handle all GET requests
exports.get = function (req) {
    //log.info("/react4xp/ service: GET req (" + typeof req + "): " + JSON.stringify(req, null, 2));
    try {
        let target = getSuffix(req.path, "react4xp").trim();
        log.info(`React4xp service target asset: '${JSON.stringify(target, null, 2)}'\nreq.path: ${req.path}`);

        if (!target) {
            throw Error(`Missing target asset in URL ('${req.path}')`);
        }

        let resource = ioLib.getResource(REACT4XP_ROOT + target);
        if (!resource || !resource.exists()) {
            resource = ioLib.getResource(REACT4XP_ROOT + target + ".js");

            if (!resource || !resource.exists()) {
                log.warning(`STATUS 404: file not found: ${REACT4XP_ROOT + target}`);
                return {
                    status: 404,
                    body: `File not found: ${target}`,
                    contentType: "text/plain"
                };
            } else {
                target += ".js";
            }
        }

        const isCss = target.endsWith(".css");

        const cacheKey = getSiteLocalCacheKey(target);
        if (ENTRIES.indexOf(target) === -1) {
            return componentsCache.get(cacheKey, function () {
                //log.info("Caching React4XP component: " + target);
                return getReact4xpHashedChunk(resource, isCss);
            });
        } else {
            return componentsCache.get(cacheKey, function () {
                //log.info("Caching React4XP entry: " + target);
                return getReact4xpEntry(resource);
            });
        }
    } catch (e) {
        log.warning(`STATUS 400: ${e.message}`);
        return {
            status: 400,
            body: e.message,
            contentType: "text/plain"
        };
    }
};
