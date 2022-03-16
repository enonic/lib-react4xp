export {handleAssetRequest as get} from '/lib/enonic/react4xp/asset/handleAssetRequest';
//export {getCachedAssetResponse as get} from '/lib/enonic/react4xp/asset/cache';

// React4xp static-asset file server, with specified cache control headers

/*import type {
	Request,
	Response,
	Resource
} from '../../index.d';



//import {toStr} from '@enonic/js-utils/value/toStr';
import {
	getResource,
	readLines
	//@ts-ignore
} from '/lib/xp/io';
//@ts-ignore
import cacheLib from '/lib/cache';
import {
    getReact4xpEntry,
    getReact4xpHashedChunk
} from '/lib/enonic/react4xp/clientCacheResources';
import {getSuffix} from '/lib/enonic/react4xp/serviceRoots';

// react4xp_constants.json is not part of lib-react4xp-runtime,
// it's an external shared-constants file expected to exist in the react4xp lib build directory.
// Easiest: the NPM package react4xp-buildconstants creates this file and copies it here.
import {
    R4X_TARGETSUBDIR,
    ENTRIES_FILENAME
	//@ts-ignore
} from '/lib/enonic/react4xp/react4xp_constants.json';
import {getSiteLocalCacheKey} from '/lib/enonic/react4xp/dependencies';
// TODO: The above (require) doesn't sem to handle re-reading updated files in XP dev runmode. Is that necessary? If so, use dependencies.readResourceAsJson instead!

const REACT4XP_ROOT = `/${R4X_TARGETSUBDIR}/`;

const componentsCache = cacheLib.newCache({
    size: 300,
    expire: 108000 // 30 hours
});

const ENTRIES = (JSON.parse(
    readLines(getResource(REACT4XP_ROOT + ENTRIES_FILENAME).getStream())
        .join(" ")
) as Array<string>).map(entry => `${entry}.js`);


// Handle all GET requests
export function get(req :Request) :Response {
    //log.info("/react4xp/ service: GET req (" + typeof req + "): " + JSON.stringify(req, null, 2));
    try {
        let target = getSuffix(req.path, "react4xp").trim();
		log.debug('get() target:%s', target);

        if (!target) {
            throw Error(`Missing target asset in URL ('${req.path}')`);
        }

        let resource :Resource = getResource(REACT4XP_ROOT + target);
        if (!resource || !resource.exists()) {
            resource = getResource(REACT4XP_ROOT + target + ".js");

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
		log.debug('get() target:%s', target);

        const isCss = target.endsWith(".css");
		log.debug('get() isCss:%s', isCss);

        const cacheKey = getSiteLocalCacheKey(target);
		log.debug('get() cacheKey:%s', cacheKey);

        if (ENTRIES.indexOf(target) === -1) {
			log.debug('get() getReact4xpHashedChunk');
            return componentsCache.get(cacheKey, function () {
                //log.info("Caching React4XP component: " + target);
                return getReact4xpHashedChunk(resource, isCss);
            });
        } else {
			log.debug('get() getReact4xpEntry');
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
};*/
