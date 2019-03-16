const utilLib = require('/lib/enonic/util');
const ioLib = require('/lib/xp/io');
const cacheLib = require('/lib/cache');
const { getAssetRoot } = require('/lib/enonic/react4xp/utils');

// react4xp_constants.json is not part of lib-react4xp-runtime,
// it's an external shared-constants file expected to exist in the build directory of this index.es6.
// Easiest: the NPM package react4xp-buildconstants creates this file and copies it here.
const {
    R4X_TARGETSUBDIR, CLIENT_CHUNKS_FILENAME, EXTERNALS_CHUNKS_FILENAME, COMPONENT_CHUNKS_FILENAME, ENTRIES_FILENAME, ASSET_URL_ROOT, BUILD_R4X
} = require('./react4xp_constants.json');

let BUILD_STATS_ENTRYPOINTS;
const ASSET_ROOT = getAssetRoot(ASSET_URL_ROOT);

const STATIC_CLIENT_URL = `/_/service/${app.name}/react4xp-client`;


const pageContributionsCache = cacheLib.newCache({
    size: 100,
    expire: 10800 // 30 hours
});


/** Takes entry names (array or a single string) and returns an array of (hashed) dependency file names, the complete set of chunks required for the entries to run.
 *  ASSUMES that stats.json.entrypoints is an object where the keys are entry names without file extensions, mapping to values that are objects,
 *  which in turn have an "assets" key, under which are the full file names of the entry's dependencies.
 *  If the input array is empty or null, returns ALL dependency chunk names. */
const getDependencies = (entryNames) => {
    if (!BUILD_STATS_ENTRYPOINTS) {
        const STATS = require(`${BUILD_R4X}/stats.json`);
        BUILD_STATS_ENTRYPOINTS = STATS.entrypoints;   
    }
    // log.info(JSON.stringify({BUILD_STATS_ENTRYPOINTS}, null, 2)); 
    
    if (typeof entryNames === "string" && entryNames.trim() !== "") {
        entryNames = [entryNames];
    } else if (!entryNames || !Array.isArray(entryNames) || entryNames.length === 0) {
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
            .filter( asset => /*!asset.endsWith('.map') &&*/ asset !== myself)
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
};






/** Wraps a url in a script tag and appends it to pageContributions.headEnd with an async tag */
const appendHeadEnd = (url, pageContributions) => {
    pageContributions.headEnd = [
        ...(pageContributions.headEnd || []),
        `<script async src="${url}" ></script>
`,
    ];
};


/** Open a chunkfile, read the contents and return the non-entry JS file references */
const getChunkNamesFromChunkfile = (chunkFile) => {
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



/** Use the json files built by webpack in other libraries (react4xp-build-components, react4xp-runtime-externals, react4xp-runtime-client)
 *  to fetch items of <script src="url" /> for common chunks: 
 *   -the dependency chunks of specific entries (array of entry names in the argument, gets all of the dependencies if empty),
 *   -an optional Externals chunk, 
 *   -and an optional frontend-client chunk (which falls back to the built-in client url if missing)? 
 * @param entries An array (also accepts string, if only one item) of Entry names for React4xp components, for which we want to build the set 
 * of dependencies. */
const buildPageContributions = (entries) => {
    
    const chunkNames = [];

    // This should not break if there are no added externals. Externals should be optional.
    try {
        chunkNames.push(...getChunkNamesFromChunkfile(`/${R4X_TARGETSUBDIR}/${EXTERNALS_CHUNKS_FILENAME}`));

    } catch (e) {
        log.warning(e);
        log.warning(`No optional externals were found (chunkfile reference: /${R4X_TARGETSUBDIR}/${EXTERNALS_CHUNKS_FILENAME}). That's probably okay.`);
    }

    chunkNames.push(...getDependencies(entries));


    // TODO: ADD SOMEWHERE ELSE?
    // Special case: if there is a chunkfile for a client wrapper, use that the same way as above. If not, fall back to
    // a reference to the built-in client wrapper service: _/services/{app.name}/react4xp-client
    try {
        chunkNames.push(...getChunkNamesFromChunkfile(`/${R4X_TARGETSUBDIR}/${CLIENT_CHUNKS_FILENAME}`));

    } catch (e) {
        // // log.info(e);
        // // log.info(`Falling back to built-in react4xp-runtime-client: ${STATIC_CLIENT_URL}`);

        chunkNames.push(STATIC_CLIENT_URL);
    }

    const pageContributions = {};
    chunkNames.forEach(chunkName => appendHeadEnd(chunkName, pageContributions));

    return pageContributions;
};



// ---------------------------------------------------------------


const getUniqueEntries = (arrayOfArrays, controlSet) => {
    const uniqueEntries = [];
    arrayOfArrays.forEach(arr => {
        utilLib.data.forceArray(arr).forEach(item => {
            if (controlSet.indexOf(item) === -1) {
                uniqueEntries.push(item);
                controlSet.push(item);
            }
        })
    });
    return uniqueEntries;
};


/** Adds page contributions for an (optional) set of entries.  Merges different pageContributions objects into one. Prevents duplicates: no single pageContribution entry is
 * repeated, this prevents resource-wasting by loading/running the same script twice).
 *
 * @param incomingPgContrib incoming pageContributions (from other components / outside / previous this rendering)
 * @param newPgContrib pageContributions that this specific component will add.
 *
 * Also part of the merge: PAGE_CONTRIBUTIONS, the common standard React4xp page contributions
 */
const getAndMergePageContributions = (entryNames, incomingPgContrib, newPgContrib) => {
    entryNames.sort();
    const entriesPgContrib = pageContributionsCache.get(entryNames.join("?"), ()=> buildPageContributions(entryNames));

    if (!incomingPgContrib && !newPgContrib) {
        return entriesPgContrib;
    }
    incomingPgContrib = incomingPgContrib || {};
    newPgContrib = newPgContrib || {};

    // Keeps track of already-added entries across headBegin, headEnd, bodyBegin and bodyEnd
    const controlSet = [];

    return {
        headBegin: getUniqueEntries([entriesPgContrib.headBegin, incomingPgContrib.headBegin, newPgContrib.headBegin], controlSet),
        headEnd: getUniqueEntries([entriesPgContrib.headEnd, incomingPgContrib.headEnd, newPgContrib.headEnd], controlSet),
        bodyBegin: getUniqueEntries([entriesPgContrib.bodyBegin, incomingPgContrib.bodyBegin, newPgContrib.bodyBegin], controlSet),
        bodyEnd: getUniqueEntries([entriesPgContrib.bodyEnd, incomingPgContrib.bodyEnd, newPgContrib.bodyEnd], controlSet)
    };
};



// ------------------------------------------------------------------

module.exports = {
    getDependencies,
    getAndMergePageContributions,
    STATIC_CLIENT_URL
};
