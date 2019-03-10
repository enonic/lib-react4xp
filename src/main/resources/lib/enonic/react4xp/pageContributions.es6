const utilLib = require('/lib/enonic/util');
var ioLib = require('/lib/xp/io');
var { getAssetRoot } = require('/lib/enonic/react4xp/utils');

// react4xp_constants.json is not part of lib-react4xp-runtime,
// it's an external shared-constants file expected to exist in the build directory of this index.es6.
// Easiest: the NPM package react4xp-buildconstants creates this file and copies it here.
const {
    R4X_TARGETSUBDIR, CLIENT_CHUNKS_FILENAME, EXTERNALS_CHUNKS_FILENAME, COMPONENT_CHUNKS_FILENAME, ENTRIES_FILENAME, ASSET_URL_ROOT
} = require('./react4xp_constants.json');

const ASSET_ROOT = getAssetRoot(ASSET_URL_ROOT);




// ---------------------------------------------------------

const appendBodyEnd = (url, pageContributions) => {
    pageContributions.bodyEnd = [
        ...(pageContributions.bodyEnd || []),
        `
<script src="${url}" ></script>`,
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
    const clientChunksFilename = CLIENT_CHUNKS_FILENAME;
    const chunkHashFiles = [
        EXTERNALS_CHUNKS_FILENAME,
        COMPONENT_CHUNKS_FILENAME
    ];

    const entries = require(`/${R4X_TARGETSUBDIR}/${ENTRIES_FILENAME}`);
    const pageContributions = {};

    chunkHashFiles.forEach(chunkFile => addPageContributionsFromChunkfile(`/${R4X_TARGETSUBDIR}/${chunkFile}`, pageContributions, entries));


    // Special case: if there is a chunkfile for a client wrapper, use that the same way as above. If not, fall back to
    // a reference to the built-in client wrapper service: _/services/{app.name}/react4xp-client
    try {
        addPageContributionsFromChunkfile(clientChunksFilename, pageContributions, entries);

    } catch (e) {
        log.info(e);

        const url = `_/service/${app.name}/react4xp-client`;
        log.info(`Falling back to built-in react4xp-runtime-client: ${url}`);


        appendBodyEnd(url, pageContributions);
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

// Standard, basic page contributions - singleton:
let PAGE_CONTRIBUTIONS = buildBasicPageContributions();

module.exports = {
    getPageContributions: ()=> {
        if (!PAGE_CONTRIBUTIONS) {
            PAGE_CONTRIBUTIONS = buildBasicPageContributions();
        }
        return PAGE_CONTRIBUTIONS;
    },
    mergePageContributions
};
