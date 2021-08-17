const ioLib = require("/lib/xp/io");
const cacheLib = require("/lib/cache");

// XP runmode: IS_PRODMODE is true in prod mode, false in dev mode.
const IS_PRODMODE = ("" + Java.type('com.enonic.xp.server.RunMode').get()) === 'PROD';




import { getAssetRoot, getClientRoot } from "./serviceRoots";

// Tolerate and remove file extensions ts(x), js(x), es(6) and/or trailing slash or space
const TOLERATED_ENTRY_EXTENSIONS = /([/ ]+|\.(tsx?|jsx?|es6?)[/ ]*)$/i;

// react4xp_constants.json is not part of lib-react4xp-runtime,
// it's an external shared-constants file expected to exist in the build directory of this index.es6.
// Easiest: the NPM package react4xp-buildconstants creates this file and copies it here.
const {
  R4X_TARGETSUBDIR,
  CLIENT_CHUNKS_FILENAME,
  EXTERNALS_CHUNKS_FILENAME,
  COMPONENT_STATS_FILENAME
} = require("./react4xp_constants.json");
// TODO: The above (require) doesn't sem to handle re-reading updated files in XP dev runmode. Is that necessary? If so, use readResourceAsJson instead!

let BUILD_STATS_ENTRYPOINTS;

const dependenciesCache = IS_PRODMODE
    ? cacheLib.newCache({
      size: 100,
      expire: 10800 // 30 hours
    })
    : null;

const FULL_EXTERNALS_CHUNKS_FILENAME = `/${R4X_TARGETSUBDIR}/${EXTERNALS_CHUNKS_FILENAME}`;
const FULL_CLIENT_CHUNKS_FILENAME = `/${R4X_TARGETSUBDIR}/${CLIENT_CHUNKS_FILENAME}`;
const FULL_COMPONENT_STATS_FILENAME = `/${R4X_TARGETSUBDIR}/${COMPONENT_STATS_FILENAME}`;

const forceTrimmedArray = (entryNames=[]) => {
    if (typeof entryNames === "string") {
        const trimmed = entryNames.trim();
        return (trimmed === "")
            ? []
            : [trimmed];
    }
    return entryNames.map(entryName => entryName.trim())
}
const normalizeEntryNames = (entryNames = []) => {
    const arr = forceTrimmedArray(entryNames);
    arr.sort()
    return arr;
};




const readResourceAsJson = fileName => {
                                                                                                                        log.debug("Reading resource: " + JSON.stringify(fileName, null, 2));
    const resource = ioLib.getResource(fileName);
    if (!resource || !resource.exists()) {
        throw Error("Empty or not found: " + fileName);
    }
    let content;
    try {
        content = ioLib.readText(resource.getStream());
    } catch (e) {
        log.error(e.message);
        throw Error("dependencies.es6 # readResourceAsJson: couldn't read resource '" + fileName + "'");
    }

    try {
        return JSON.parse(content);

    } catch (e) {
        log.error(e.message);
        log.info("Content dump from '" + fileName + "':\n" + content);
        throw Error("dependencies.es6 # readResourceAsJson: couldn't parse as JSON content of resource  '" + fileName + "'");
    }
};







/** Takes entry names (array or a single string) and returns an array of (hashed) dependency file names, the complete set of chunks required for the set of entries to run.
 *  ASSUMES that stats.json.entrypoints is an object where the keys are entry names without file extensions, mapping to values that are objects,
 *  which in turn have an "assets" key, under which are the full file names of the entry's dependencies.
 *  If the input array is empty or null, returns ALL dependency chunk names. */
const readComponentChunkNames = entryNames => {

    // Just verify that it exists and has a content:
    let STATS = readResourceAsJson(FULL_COMPONENT_STATS_FILENAME);

    BUILD_STATS_ENTRYPOINTS = STATS.entrypoints;


    if (entryNames.length === 0) {
        entryNames = Object.keys(BUILD_STATS_ENTRYPOINTS);
    }
    const output = [];
    const missing = [];

    entryNames.forEach(entry => {
        try {
            let data = BUILD_STATS_ENTRYPOINTS[entry];
            if (!data) {
                log.debug(`Cleaning entry name: '${entry}'`);
                entry = entry.trim();
                if (TOLERATED_ENTRY_EXTENSIONS.test(entry)) {
                    entry = entry.replace(TOLERATED_ENTRY_EXTENSIONS, '');
                }
                data = BUILD_STATS_ENTRYPOINTS[entry];
                if (!data) {
                    throw new Error(`Requested entry '${entry}' not found in ${COMPONENT_STATS_FILENAME}`)
                }
            }
            if (data.assets === undefined) {
                throw new Error(`Requested entry '${entry}' is missing assets`);
            }

            const myself = entry + ".js";
            data.assets
                // Each asset can be a string (webpack 4) or an object with a subattribute string .name (webpack 5)
                .map(asset => {
                    if (typeof asset === 'string') {
                        return asset;
                    }
                    if (typeof asset === 'object' && typeof asset.name === 'string') {
                        return asset.name
                    }

                    throw Error(`Unexpected 'assets' structure in ${COMPONENT_STATS_FILENAME}: ${JSON.stringify(data.assets)}`);
                })
                .filter(asset => !asset.endsWith(".map") && asset !== myself)
                .forEach(asset => {
                    if (output.indexOf(asset) === -1) {
                        output.push(asset);
                    }
                });

        } catch (e) {
            log.warning(e.message);
            missing.push(entry);
        }
    });

    if (missing.length > 0) {
        throw Error(
            `Couldn't find dependencies for ${missing.length} entries: '${missing.join(', ')}'`
        );
    }

    return output;
}

// Cached version of readComponentChunkNames - used in prod mode
const readComponentChunkNamesCached = entryNames => {
  entryNames = normalizeEntryNames(entryNames);
  const entryNamesKey = entryNames.join("*");

  return dependenciesCache.get(entryNamesKey, () => readComponentChunkNames(entryNames));
};

const getComponentChunkNames = IS_PRODMODE
    ? readComponentChunkNamesCached
    : entryNames => readComponentChunkNames(forceTrimmedArray(entryNames));







const getComponentChunkUrls = entries =>
  getComponentChunkNames(entries).map(name => getAssetRoot() + name);








/** Returns the asset-via-service URL for the externals chunk */
const readExternalsUrls = () => {
    // This should not break if there are no added externals. Externals should be optional.
    try {
        return getNamesFromChunkfile(FULL_EXTERNALS_CHUNKS_FILENAME).map(
            name => getAssetRoot() + name
        );
    } catch (e) {
        log.warning(e);
        log.warning(
            `No optional externals were found (chunkfile reference: ${FULL_EXTERNALS_CHUNKS_FILENAME}). That might be okay, or a problem.`
        );
        return [];
    }
};

const readExternalsUrlsCached = () =>
  dependenciesCache.get(FULL_EXTERNALS_CHUNKS_FILENAME, readExternalsUrls);

const getExternalsUrls = IS_PRODMODE
    ? readExternalsUrlsCached
    : readExternalsUrls;





const readClientUrls = () => {
    // Special case: if there is a chunkfile for a client wrapper, use that. If not, fall back to
    // a reference to the built-in client wrapper service: _/services/{app.name}/react4xp-client
    try {
        return getNamesFromChunkfile(FULL_CLIENT_CHUNKS_FILENAME).map(
            name => getAssetRoot() + name
        );
    } catch (e) {
        log.debug(e);
        log.debug(
            `No optional clientwrapper was found (chunkfile reference: ${FULL_CLIENT_CHUNKS_FILENAME}). That's okay, there's a fallback one at: ${getClientRoot()}`
        );
        return [getClientRoot()];
    }
};

/** Returns the asset-via-service URL for the frontend client */
const readClientUrlsCached = () =>
  dependenciesCache.get(FULL_CLIENT_CHUNKS_FILENAME, readClientUrls);

const getClientUrls = IS_PRODMODE
    ? readClientUrlsCached
    : readClientUrls;






const getAllUrls = (entries, suppressJS) => [
  ...getExternalsUrls(),
  ...getComponentChunkUrls(entries),
  ...suppressJS
      ? []
      : getClientUrls()
].filter(!suppressJS
    ? chunkUrl => chunkUrl
    : chunkUrl => !chunkUrl.endsWith(".js")
);

/** Open a chunkfile, read the contents and return the domain-relative urls for non-entry JS file references in the chunk file.
 * Throws an error if not found or if unexpected format. */
const getNamesFromChunkfile = chunkFile => {

  const chunks = readResourceAsJson(chunkFile);

  return Object.keys(chunks).map(chunkName => {
    let chunk = chunks[chunkName].js;

    while (Array.isArray(chunk)) {
      if (chunk.length > 1) {
        throw Error(
          `Unexpected value in ${chunkFile}: [${chunkName}].js is an array with more than 1 array: ${JSON.stringify(
            chunk,
            null,
            2
          )}`
        );
      }
      chunk = chunk[0];
    }

    if (chunk.startsWith("/")) {
      chunk = chunk.substring(1);
    }

    // Fail fast: verify that it exists and has a content
    const resource = ioLib.getResource(`/${R4X_TARGETSUBDIR}/${chunk}`);
    if (!resource || !resource.exists()) {
      throw Error(
        `React4xp dependency chunk not found: /${R4X_TARGETSUBDIR}/${chunk}`
      );
    }

    return chunk;
  });
};

// ------------------------------------------------------------------

module.exports = {
  normalizeEntryNames,
  getComponentChunkNames,
  getComponentChunkUrls,
  getClientUrls,
  getNamesFromChunkfile,
  getExternalsUrls,
  getAllUrls,
  getAssetRoot
};
