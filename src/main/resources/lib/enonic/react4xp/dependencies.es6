
const ioLib = require('/lib/xp/io');


const { getAssetRoot } = require('/lib/enonic/react4xp/utils');

// react4xp_constants.json is not part of lib-react4xp-runtime,
// it's an external shared-constants file expected to exist in the build directory of this index.es6.
// Easiest: the NPM package react4xp-buildconstants creates this file and copies it here.
const {
    R4X_TARGETSUBDIR, CLIENT_CHUNKS_FILENAME, EXTERNALS_CHUNKS_FILENAME, ASSET_URL_ROOT
} = require('./react4xp_constants.json');

let BUILD_STATS_ENTRYPOINTS;
const ASSET_ROOT = getAssetRoot(ASSET_URL_ROOT);

const STATIC_CLIENT_URL = `/_/service/${app.name}/react4xp-client`;


const cacheLib = require('/lib/cache');
const dependenciesCache = cacheLib.newCache({
    size: 100,
    expire: 10800 // 30 hours
});

const FULL_EXTERNALS_CHUNKS_FILENAME = `/${R4X_TARGETSUBDIR}/${EXTERNALS_CHUNKS_FILENAME}`;
const FULL_CLIENT_CHUNKS_FILENAME = `/${R4X_TARGETSUBDIR}/${CLIENT_CHUNKS_FILENAME}`;


/** Takes entry names (array or a single string) and returns an array of (hashed) dependency file names, the complete set of chunks required for the entries to run.
 *  ASSUMES that stats.json.entrypoints is an object where the keys are entry names without file extensions, mapping to values that are objects,
 *  which in turn have an "assets" key, under which are the full file names of the entry's dependencies.
 *  If the input array is empty or null, returns ALL dependency chunk names. */
const getComponentChunkNames = (entryNames) => {

    entryNames = entryNames || [];
    if (typeof entryNames === "string") {
        const trimmed = entryNames.trim();
        entryNames = (trimmed === "") ? [] : [trimmed];
    } else {
        entryNames.sort();
    }
    const entryNamesKey = entryNames.join("?");

    return dependenciesCache.get(entryNamesKey, ()=>{
        log.info(`Caching component chunk names for key: ${entryNamesKey}`);

        if (!BUILD_STATS_ENTRYPOINTS) {
            const STATS = require(`/${R4X_TARGETSUBDIR}/stats.json`);
            BUILD_STATS_ENTRYPOINTS = STATS.entrypoints;
            log.info("BUILD_STATS_ENTRYPOINTS (" + typeof BUILD_STATS_ENTRYPOINTS + "): " + JSON.stringify(BUILD_STATS_ENTRYPOINTS, null, 2));
        }

        if (entryNames.length === 0) {
            entryNames = Object.keys(BUILD_STATS_ENTRYPOINTS);
        }
        const output = [];
        const missing = [];

        entryNames.forEach( entry => {
            entry = entry.trim();

            // log.info("\n\n\nentry: " + JSON.stringify(entry, null, 2));
            let data = BUILD_STATS_ENTRYPOINTS[entry];
            if (!data) {
                while (entry.endsWith('/')) {
                    const replacement = entry.slice(0, -1);
                    log.warning(`Dependency not found for entry '${entry}'. Trying '${replacement}...`);
                    entry = replacement;
                }
                data = BUILD_STATS_ENTRYPOINTS[entry];
                while (!data && entry.endsWith('.js')) {
                    const replacement = entry.slice(0, -3);
                    log.warning(`Dependency not found for entry '${entry}'. Trying '${replacement}'...`);
                    entry = replacement;
                    data = BUILD_STATS_ENTRYPOINTS[entry];
                }
                while (!data && entry.endsWith('.jsx')) {
                    const replacement = entry.slice(0, -4);
                    log.warning(`Dependency not found for entry '${entry}'. Trying '${replacement}'...`);
                    entry = replacement;
                    data = BUILD_STATS_ENTRYPOINTS[entry];
                }
            }
            if (!data) {
                missing.push(`'${entry}'`);
                return;
            }
            if (!Array.isArray(data.assets)) {
                throw Error(`Bad format under dependencies for entry '${entry}': assets = ${JSON.stringify(data.assets)}`);
                return;
            }
            // log.info("\ndata.assets: " + JSON.stringify(data.assets, null, 2));

            const myself = entry + '.js';
            data.assets
                .filter( asset => !asset.endsWith('.map') && asset !== myself)
                .forEach (asset => {
                    // // log.info("\tasset: " + JSON.stringify(asset, null, 2));
                    if (output.indexOf(asset) === -1) {
                        // // log.info("\t\tpushing.");
                        output.push(asset);
                    }
                });
        });
        // log.info("output: " + JSON.stringify(output, null, 2));

        if (missing.length > 0) {
            throw Error(`Couldn't find dependencies for entries: ${missing.join(', ')}`);
        }

        return output;
    });

};


const getComponentChunkUrls = entries => getComponentChunkNames(entries).map(name => ASSET_ROOT + name);


/** Returns the asset-via-service URL for the externals chunk */
const getExternalsUrls = () => dependenciesCache.get(FULL_EXTERNALS_CHUNKS_FILENAME, ()=> {

    // This should not break if there are no added externals. Externals should be optional.
    try {
        return getUrlsFromChunkfile(FULL_EXTERNALS_CHUNKS_FILENAME);

    } catch (e) {
        log.warning(e);
        log.warning(`No optional externals were found (chunkfile reference: ${FULL_EXTERNALS_CHUNKS_FILENAME}). That's probably okay.`);
        return [];
    }
});


/** Returns the asset-via-service URL for the frontend client */
const getClientUrls = dependenciesCache.get(FULL_CLIENT_CHUNKS_FILENAME, ()=> {
    // Special case: if there is a chunkfile for a client wrapper, use that. If not, fall back to
    // a reference to the built-in client wrapper service: _/services/{app.name}/react4xp-client
    try {
        return getUrlsFromChunkfile(FULL_CLIENT_CHUNKS_FILENAME);

    } catch (e) {
        // // log.info(e);
        // // log.info(`Falling back to built-in react4xp-runtime-client: ${STATIC_CLIENT_URL}`);

        return [STATIC_CLIENT_URL];
    }
});

/** Open a chunkfile, read the contents and return the domain-relative urls for non-entry JS file references in the chunk file */
const getUrlsFromChunkfile = (chunkFile) => {
    const chunks = require(chunkFile);
    //// // log.info("chunks: " + JSON.stringify(chunks, null, 2));
    return Object.keys(chunks).forEach(chunkName => {

        //// // log.info("chunkName: " + JSON.stringify(chunkName, null, 2));
        let chunk = chunks[chunkName].js;
        //// // log.info("chunk: " + JSON.stringify(chunk, null, 2));

        while (Array.isArray(chunk)) {
            if (chunk.length > 1) {
                throw Error(`Unexpected value in ${chunkFile}: [${chunkName}].js is an array with more than 1 array: ${JSON.stringify(chunk, null, 2)}`);
            }
            chunk = chunk[0];
        }

        if (chunk.startsWith('/')) {
            chunk = chunk.substring(1);
        }

        // Just verify that it exists and has a content:
        const resource = ioLib.getResource(`/${R4X_TARGETSUBDIR}/${chunk}`);
        if (!resource || !resource.exists()) {
            throw Error(`React4xp dependency chunk not found: /${R4X_TARGETSUBDIR}/${chunk}`);
        }

        return ASSET_ROOT + chunk;
    });
};



// ------------------------------------------------------------------

module.exports = {
    getComponentChunkNames,
    getComponentChunkUrls,
    getClientUrls,
    getExternalsUrls,
    STATIC_CLIENT_URL
};
