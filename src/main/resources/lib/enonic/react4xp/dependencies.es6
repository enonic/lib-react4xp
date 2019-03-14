const utilLib = require('/lib/enonic/util');
var ioLib = require('/lib/xp/io');
var { getAssetRoot } = require('/lib/enonic/react4xp/utils');

// react4xp_constants.json is not part of lib-react4xp-runtime,
// it's an external shared-constants file expected to exist in the build directory of this index.es6.
// Easiest: the NPM package react4xp-buildconstants creates this file and copies it here.
const {
    R4X_TARGETSUBDIR, CLIENT_CHUNKS_FILENAME, EXTERNALS_CHUNKS_FILENAME, COMPONENT_CHUNKS_FILENAME, ENTRIES_FILENAME, ASSET_URL_ROOT, BUILD_R4X
} = require('./react4xp_constants.json');

const BUILD_STATS_ENTRYPOINTS = require(`${BUILD_R4X}/stats.json`).entrypoints;

const ASSET_ROOT = getAssetRoot(ASSET_URL_ROOT);

const STATIC_CLIENT_URL = `/_/service/${app.name}/react4xp-client`;




// --------------------------------------------------------- New school


/** Takes an array of entry names and returns an array of (hashed) dependency file names, the complete set of chunks required for the entries to run.
 *  ASSUMES that stats.json.entrypoints is an object where the keys are entry names without file extensions, mapping to values that are objects,
 *  which in turn have an "assets" key, under which are the full file names of the entry's dependencies.
 *  If the input array is empty or null, returns ALL dependency chunk names. */
const getDependencies = (entryNames) => {
    if (!entryNames || !Array.isArray(entryNames) || entryNames.length === 0) {
        entryNames = Object.keys(BUILD_STATS_ENTRYPOINTS);
    }

    const output = [];
    let errors = null;

    entryNames.forEach( entry => {
        let data = BUILD_STATS_ENTRYPOINTS[entry];
        while (entry.length > 0 && !data) {
            if (entry.endsWith('.js') {
                entry = entry.slice(0, -3);
            }
            data = BUILD_STATS_ENTRYPOINTS[entry];
            if (!data && entry.endsWith('.jsx') {
                entry = entry.slice(0, -4);
            }
            data = BUILD_STATS_ENTRYPOINTS[entry];
        }
        if (!data)
            errors = `${(errors || "")}Couldn't find dependencies for entry: ${entry}}\n`);
            continue;
        }

        TODO HERE: enter data.assets, add all chunk names not already in <output> and not ending in .map and not same name as the entry
    });


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
    //log.info("chunks: " + JSON.stringify(chunks, null, 2));
    Object.keys(chunks).forEach(chunkName => {

        // We're only looking for dependencies here, not entry files (components and such).
        if (entries.indexOf(chunkName) === -1) {
            //log.info("chunkName: " + JSON.stringify(chunkName, null, 2));
            let chunk = chunks[chunkName].js;
            //log.info("chunk: " + JSON.stringify(chunk, null, 2));

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
        log.info(e);
        log.info(`Falling back to built-in react4xp-runtime-client: ${STATIC_CLIENT_URL}`);

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
const PAGE_CONTRIBUTIONS = buildBasicPageContributions();

// Every basic-dependencies page contribution in a single list:
const buildBasicPageContributionsAsList = pageContributions => [
    ...(pageContributions.headBegin || []),
    ...(pageContributions.headEnd || []),
    ...(pageContributions.bodyBegin || []),
    ...(pageContributions.bodyEnd || [])
];
const PAGE_CONTRIBUTIONS_ASLIST = buildBasicPageContributionsAsList(PAGE_CONTRIBUTIONS);
const PAGE_CONTRIBUTIONS_HTML = PAGE_CONTRIBUTIONS_ASLIST.join("");
module.exports = {
    mergePageContributions,
    PAGE_CONTRIBUTIONS,
    PAGE_CONTRIBUTIONS_ASLIST,
    PAGE_CONTRIBUTIONS_HTML,
    STATIC_CLIENT_URL
};
