// React4xp static-asset file server, with specified cache control headers

var ioLib = require('/lib/xp/io');
var utilLib = require('/lib/enonic/util');
var cacheLib = require('/lib/cache');

// expected to be copied to the correct build folder by e.g. gradle. Must match the file name of the generated file.
const CONFIG = require('/lib/enonic/react4xp/react4xp_constants.json');

const R4X = CONFIG.R4X_TARGETSUBDIR;

// react4xp is correct to hardcode here instead of reading from the constants file.
const SERVICE_ROOT = `/_/service/${app.name}/react4xp/`;
log.info("SERVICE_ROOT: " + JSON.stringify(SERVICE_ROOT, null, 2));
const REACT4XP_ROOT = `/${R4X}/`;




const react4xpCache = cacheLib.newCache({
    size: 100,
    expire: 108000 // 30 hours
});


// For content-hashed chunks, Cache-Control should be "public, max-age=31536000". For others, ETag and no-cache?  Use the commonChunks files to figure this out.
const ENTRIES = JSON.parse(
    ioLib.readLines(
        ioLib.getResource(REACT4XP_ROOT + "entries.json").getStream()
    ).join(" ")
).map(entry => `${entry}.js`);



// Adjusted from https://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
const hash = (string) => {
    var hash = 0, i, chr;
    if (string.length === 0) return hash;
    for (i = 0; i < string.length; i++) {
        chr   = string.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return (Math.abs(hash)).toString(36);
};



const getReact4xpEntry = (resource) => {
    //const then = new Date().getTime();
    const fileContent = utilLib.data.forceArray(ioLib.readLines(resource.getStream())).join("\n");
    const ETag = hash(fileContent);
    //const now = new Date().getTime();
    //.info(`ETag '${ETag}' in ${now - then} ms.`);
    return {
        body: fileContent,
        headers: {
            'Content-Type': 'application/javascript;charset=utf-8',
            'Cache-Control': 'no-cache',
            ETag,
        }
    };
};



const getReact4xpNonEntry = (resource) => {
    const fileContent = utilLib.data.forceArray(ioLib.readLines(resource.getStream())).join("\n");
    return {
        body: fileContent,
        headers: {
            'Content-Type': 'application/javascript;charset=utf-8',
            'Cache-Control': 'public, max-age=31536000'
        }
    };
};




// Handle all GET requests
exports.get = function (req) {
    if ((req.path || "").startsWith(SERVICE_ROOT)) {
        const target = (req.path.substring(SERVICE_ROOT.length) || "").trim();
        if (!target) {
            return {
                status: 400,
            }
        }

        log.info("React4xp target: " + JSON.stringify(target, null, 2));

        const resource = ioLib.getResource(REACT4XP_ROOT + target);
        if (!resource || !resource.exists()) {
            log.warning(`File not found: ${REACT4XP_ROOT + target}`);
            return {
                status: 404,
            }
        }

        if (ENTRIES.indexOf(target) === -1) {
            return react4xpCache.get(target, function() {
                log.info("Caching React4XP component: " + target);
                return getReact4xpNonEntry(resource);
            });

        } else {
            return react4xpCache.get(target, function() {
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
