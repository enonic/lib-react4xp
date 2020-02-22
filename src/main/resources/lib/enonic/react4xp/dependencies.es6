const ioLib = require("/lib/xp/io");
const cacheLib = require("/lib/cache");

import { getAssetRoot, getClientRoot } from "./serviceRoots";

// react4xp_constants.json is not part of lib-react4xp-runtime,
// it's an external shared-constants file expected to exist in the build directory of this index.es6.
// Easiest: the NPM package react4xp-buildconstants creates this file and copies it here.
const {
  R4X_TARGETSUBDIR,
  CLIENT_CHUNKS_FILENAME,
  EXTERNALS_CHUNKS_FILENAME,
  COMPONENT_STATS_FILENAME
} = require("./react4xp_constants.json");

let BUILD_STATS_ENTRYPOINTS;

const dependenciesCache = cacheLib.newCache({
  size: 100,
  expire: 10800 // 30 hours
});

const FULL_EXTERNALS_CHUNKS_FILENAME = `/${R4X_TARGETSUBDIR}/${EXTERNALS_CHUNKS_FILENAME}`;
const FULL_CLIENT_CHUNKS_FILENAME = `/${R4X_TARGETSUBDIR}/${CLIENT_CHUNKS_FILENAME}`;

const normalizeEntryNames = (entryNames = []) => {
  if (typeof entryNames === "string") {
    const trimmed = entryNames.trim();
    entryNames = trimmed === "" ? [] : [trimmed];
  } else {
    entryNames.sort();
  }
  return entryNames;
};

/** Takes entry names (array or a single string) and returns an array of (hashed) dependency file names, the complete set of chunks required for the set of entries to run.
 *  ASSUMES that stats.json.entrypoints is an object where the keys are entry names without file extensions, mapping to values that are objects,
 *  which in turn have an "assets" key, under which are the full file names of the entry's dependencies.
 *  If the input array is empty or null, returns ALL dependency chunk names. */
const getComponentChunkNames = entryNames => {
  entryNames = normalizeEntryNames(entryNames);
  const entryNamesKey = entryNames.join("*");

  return dependenciesCache.get(entryNamesKey, () => {
    //log.info(`Caching component chunk names for key: ${entryNamesKey}`);

    if (!BUILD_STATS_ENTRYPOINTS) {
      const STATS = require(`/${R4X_TARGETSUBDIR}/${COMPONENT_STATS_FILENAME}`);
      BUILD_STATS_ENTRYPOINTS = STATS.entrypoints;
    }

    if (entryNames.length === 0) {
      entryNames = Object.keys(BUILD_STATS_ENTRYPOINTS);
    }
    const output = [];
    const missing = [];

    entryNames.forEach(entry => {
      entry = entry.trim();

      const data = BUILD_STATS_ENTRYPOINTS[entry];
      const myself = entry + ".js";
      data.assets
        .filter(asset => !asset.endsWith(".map") && asset !== myself)
        .forEach(asset => {
          if (output.indexOf(asset) === -1) {
            output.push(asset);
          }
        });
    });

    if (missing.length > 0) {
      throw Error(
        `Couldn't find dependencies for entries: '${missing.join(', ')}'`
      );
    }

    return output;
  });
};

const getComponentChunkUrls = entries =>
  getComponentChunkNames(entries).map(name => getAssetRoot() + name);

/** Returns the asset-via-service URL for the externals chunk */
const getExternalsUrls = () =>
  dependenciesCache.get(FULL_EXTERNALS_CHUNKS_FILENAME, () => {
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
  });

/** Returns the asset-via-service URL for the frontend client */
const getClientUrls = () =>
  dependenciesCache.get(FULL_CLIENT_CHUNKS_FILENAME, () => {
    // Special case: if there is a chunkfile for a client wrapper, use that. If not, fall back to
    // a reference to the built-in client wrapper service: _/services/{app.name}/react4xp-client
    try {
      return getNamesFromChunkfile(FULL_CLIENT_CHUNKS_FILENAME).map(
        name => getAssetRoot() + name
      );
    } catch (e) {
      log.warning(e);
      log.warning(
        `No optional clientwrapper were found (chunkfile reference: ${FULL_CLIENT_CHUNKS_FILENAME}). That's okay, there's a fallback one at: ${getClientRoot()}`
      );
      return [getClientRoot()];
    }
  });

const getAllUrls = entries => [
  ...getExternalsUrls(),
  ...getComponentChunkUrls(entries),
  ...getClientUrls()
];

/** Open a chunkfile, read the contents and return the domain-relative urls for non-entry JS file references in the chunk file.
 * Throws an error if not found or if unexpected format. */
const getNamesFromChunkfile = chunkFile => {
  const chunks = require(chunkFile);
  //// // log.info("chunks: " + JSON.stringify(chunks, null, 2));
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

    // Just verify that it exists and has a content:
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
