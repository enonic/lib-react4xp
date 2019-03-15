const utilLib = require('/lib/enonic/util');
var ioLib = require('/lib/xp/io');
var { getAssetRoot } = require('/lib/enonic/react4xp/utils');

// react4xp_constants.json is not part of lib-react4xp-runtime,
// it's an external shared-constants file expected to exist in the build directory of this index.es6.
// Easiest: the NPM package react4xp-buildconstants creates this file and copies it here.
const {
    R4X_TARGETSUBDIR, CLIENT_CHUNKS_FILENAME, EXTERNALS_CHUNKS_FILENAME, COMPONENT_CHUNKS_FILENAME, ENTRIES_FILENAME, ASSET_URL_ROOT, BUILD_R4X
} = require('./react4xp_constants.json');

let BUILD_STATS_ENTRYPOINTS;
const ASSET_ROOT = getAssetRoot(ASSET_URL_ROOT);

const STATIC_CLIENT_URL = `/_/service/${app.name}/react4xp-client`;




// --------------------------------------------------------- New school


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
    let errors = null;

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
            errors = `${(errors || "")}Couldn't find dependencies for entry '${entry}'\n`;
            //log.warning("errors: " + JSON.stringify(errors, null, 2));
            return;
        }
        if (!Array.isArray(data.assets)) {
            errors = `${(errors || "")}Bad format under dependencies for entry '${entry}': assets = ${JSON.stringify(data.assets)}\n`;
            //log.warning("errors: " + JSON.stringify(errors, null, 2));
            return;
        }
        // log.info("\ndata.assets: " + JSON.stringify(data.assets, null, 2));

        try {
            const myself = entry + '.js';
            // log.info("myself: " + JSON.stringify(myself, null, 2));
            data.assets
                .filter( asset => !asset.endsWith('.map') && asset !== myself)
                .forEach (asset => {
                    // // log.info("\tasset: " + JSON.stringify(asset, null, 2));
                    if (output.indexOf(asset) === -1) {
                        // // log.info("\t\tpushing.");
                        output.push(asset);
                    }
                });

        } catch (e) {
            errors = `${(errors || "")}${e.message}\n`;
            //log.warning("errors: " + JSON.stringify(errors, null, 2));
            return;
        }
    });
    // log.info("errors: " + JSON.stringify(errors, null, 2));
    // log.info("output: " + JSON.stringify(output, null, 2));

    if (errors) {
        throw new Error(errors);
    }

    return output;
};






































// --------------------------------------------------------  Old school

const appendBodyEnd = (url, pageContributions) => {
    pageContributions.bodyEnd = [
        ...(pageContributions.bodyEnd || []),
        `<script src="${url}" ></script>
`,
    ];
};


/** Open a chunkfile, read the contents and add the non-entry JS file references to the pageContributions list */
const addPageContributionsFromChunkfile = (chunkFile, pageContributions, entries) => {
    const chunks = require(chunkFile);
    //// // log.info("chunks: " + JSON.stringify(chunks, null, 2));
    Object.keys(chunks).forEach(chunkName => {

        // We're only looking for dependencies here, not entry files (components and such).
        if (entries.indexOf(chunkName) === -1) {
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

            appendBodyEnd(ASSET_ROOT + chunk, pageContributions);
        };
    });
};



// Use the json files built by webpack to fetch the contenthashed filenames for commonChunks.
// Then use those to build a set of basic page contributions common to all components:
/** Reads and parses file names from webpack-generated JSON files that list up contenthashed bundle chunk names. */
const buildBasicPageContributions = () => {
    const entries = require(`/${R4X_TARGETSUBDIR}/${ENTRIES_FILENAME}`);
    const pageContributions = {};

    // This should not break if there are no added externals. Externals should be optional.
    try {
        addPageContributionsFromChunkfile(`/${R4X_TARGETSUBDIR}/${EXTERNALS_CHUNKS_FILENAME}`, pageContributions, entries);
    } catch (e) {
        log.warning(e);
        log.warning(`No externals were found (chunkfile reference: /${R4X_TARGETSUBDIR}/${EXTERNALS_CHUNKS_FILENAME}). That's probably okay.`);
    }

    addPageContributionsFromChunkfile(`/${R4X_TARGETSUBDIR}/${COMPONENT_CHUNKS_FILENAME}`, pageContributions, entries);

    // Special case: if there is a chunkfile for a client wrapper, use that the same way as above. If not, fall back to
    // a reference to the built-in client wrapper service: _/services/{app.name}/react4xp-client
    try {
        addPageContributionsFromChunkfile(`/${R4X_TARGETSUBDIR}/${CLIENT_CHUNKS_FILENAME}`, pageContributions, entries);


    } catch (e) {
        // // log.info(e);
        // // log.info(`Falling back to built-in react4xp-runtime-client: ${STATIC_CLIENT_URL}`);

        appendBodyEnd(STATIC_CLIENT_URL, pageContributions);
    }

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


/** Merges different pageContributions objects into one. Prevents duplicates: no single pageContribution entry is
 * repeated, this prevents resource-wasting by loading/running the same script twice).
 *
 * @param incomingPgContrib incoming pageContributions (from other components / outside / previous this rendering)
 * @param newPgContrib pageContributions that this specific component will add.
 *
 * Also part of the merge: PAGE_CONTRIBUTIONS, the common standard React4xp page contributions
 */
const mergePageContributions = (incomingPgContrib, newPgContrib) => {
    if (!incomingPgContrib && !newPgContrib) {
        return {...PAGE_CONTRIBUTIONS};
    }
    incomingPgContrib = incomingPgContrib || {};
    newPgContrib = newPgContrib || {};
    const controlSet = [];
    return {
        headBegin: getUniqueEntries([PAGE_CONTRIBUTIONS.headBegin, incomingPgContrib.headBegin, newPgContrib.headBegin], controlSet),
        headEnd: getUniqueEntries([PAGE_CONTRIBUTIONS.headEnd, incomingPgContrib.headEnd, newPgContrib.headEnd], controlSet),
        bodyBegin: getUniqueEntries([PAGE_CONTRIBUTIONS.bodyBegin, incomingPgContrib.bodyBegin, newPgContrib.bodyBegin], controlSet),
        bodyEnd: getUniqueEntries([PAGE_CONTRIBUTIONS.bodyEnd, incomingPgContrib.bodyEnd, newPgContrib.bodyEnd], controlSet)
    };
};



// ------------------------------------------------------------------

// Standard, basic-dependencies page contributions:
//const PAGE_CONTRIBUTIONS = buildBasicPageContributions();

// Every basic-dependencies page contribution in a single list:
const buildBasicPageContributionsAsList = pageContributions => [
    ...(pageContributions.headBegin || []),
    ...(pageContributions.headEnd || []),
    ...(pageContributions.bodyBegin || []),
    ...(pageContributions.bodyEnd || [])
];
//const PAGE_CONTRIBUTIONS_ASLIST = buildBasicPageContributionsAsList(PAGE_CONTRIBUTIONS);
//const PAGE_CONTRIBUTIONS_HTML = PAGE_CONTRIBUTIONS_ASLIST.join("");
module.exports = {
    getDependencies,
    mergePageContributions,
    //PAGE_CONTRIBUTIONS,
    //PAGE_CONTRIBUTIONS_ASLIST,
    //PAGE_CONTRIBUTIONS_HTML,
    STATIC_CLIENT_URL
};
