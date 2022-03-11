import type {
	OneOrMore,
	//PageContributions,
	React4xp as React4xpNamespace
} from '../../../index.d';


//import {isString} from '@enonic/js-utils';
import {isString} from '@enonic/js-utils/value/isString';
import {toStr} from '@enonic/js-utils/value/toStr';

import {
	getResource,
	readText
	//@ts-ignore
} from '/lib/xp/io';
//@ts-ignore
import cacheLib from '/lib/cache';
//@ts-ignore
import {getSite} from '/lib/xp/portal';

import {
	getAssetRoot,
	getClientRoot
} from "./serviceRoots";

// react4xp_constants.json is not part of lib-react4xp-runtime,
// it's an external shared-constants file expected to exist in the build directory of this index.es6.
// Easiest: the NPM package react4xp-buildconstants creates this file and copies it here.
import {
    R4X_TARGETSUBDIR,
    CLIENT_CHUNKS_FILENAME,
    EXTERNALS_CHUNKS_FILENAME,
    COMPONENT_STATS_FILENAME
	//@ts-ignore
//} from './react4xp_constants.json';
} from '/lib/enonic/react4xp/react4xp_constants.json';
// TODO: The above (require) doesn't sem to handle re-reading updated files in XP dev runmode. Is that necessary? If so, use readResourceAsJson instead!

type Asset = string|{name :string};


// XP runmode: IS_PRODMODE is true in prod mode, false in dev mode.
const IS_PRODMODE = ("" + Java.type('com.enonic.xp.server.RunMode').get()) === 'PROD';

// Tolerate and remove file extensions ts(x), js(x), es(6) and/or trailing slash or space
const TOLERATED_ENTRY_EXTENSIONS = /([/ ]+|\.(tsx?|jsx?|es6?)[/ ]*)$/i;

let buildStatsEntrypoints :Object|undefined;

const dependenciesCache = IS_PRODMODE
    ? cacheLib.newCache({
        size: 300,
        expire: 10800 // 30 hours
    })
    : null;

const FULL_EXTERNALS_CHUNKS_FILENAME = `/${R4X_TARGETSUBDIR}/${EXTERNALS_CHUNKS_FILENAME}`;
const FULL_CLIENT_CHUNKS_FILENAME = `/${R4X_TARGETSUBDIR}/${CLIENT_CHUNKS_FILENAME}`;
const FULL_COMPONENT_STATS_FILENAME = `/${R4X_TARGETSUBDIR}/${COMPONENT_STATS_FILENAME}`;


function forceTrimmedArray(entryNames :OneOrMore<React4xpNamespace.EntryName> = []) :Array<React4xpNamespace.EntryName> {
    if (isString(entryNames)) {
        const trimmed = entryNames.trim();
        return (trimmed === "")
            ? []
            : [trimmed];
    }
    return entryNames.map(entryName => entryName.trim())
}


export function normalizeEntryNames(entryNames :OneOrMore<React4xpNamespace.EntryName> = []) :Array<React4xpNamespace.EntryName> {
    const arr = forceTrimmedArray(entryNames);
    arr.sort()
    return arr;
}


function readResourceAsJson(fileName :string) :unknown {
	//log.debug("Reading resource: " + JSON.stringify(fileName, null, 2));
    const resource = getResource(fileName);
    if (!resource || !resource.exists()) {
        throw Error("Empty or not found: " + fileName);
    }
    let content :string;
    try {
        content = readText(resource.getStream());
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
}


/** Takes entry names (array or a single string) and returns an array of (hashed) dependency file names, the complete set of chunks required for the set of entries to run.
 *  ASSUMES that stats.json.entrypoints is an object where the keys are entry names without file extensions, mapping to values that are objects,
 *  which in turn have an "assets" key, under which are the full file names of the entry's dependencies.
 *  If the input array is empty or null, returns ALL dependency chunk names. */
function readComponentChunkNames(entryNames :OneOrMore<React4xpNamespace.EntryName>) {

    // Just verify that it exists and has a content:
    let STATS = readResourceAsJson(FULL_COMPONENT_STATS_FILENAME) as {
		entrypoints :Object
	};

    buildStatsEntrypoints = STATS.entrypoints;


    if (entryNames.length === 0) {
        entryNames = Object.keys(buildStatsEntrypoints)// as Array<React4xpNamespace.EntryName>;
    }
    const output = [];
    const missing = [];

    (entryNames as Array<React4xpNamespace.EntryName>).forEach(entry => {
        try {
            let data = buildStatsEntrypoints[entry];
            if (!data) {
                //log.debug(`Cleaning entry name: '${entry}'`);
                entry = entry.trim();
                if (TOLERATED_ENTRY_EXTENSIONS.test(entry)) {
                    entry = entry.replace(TOLERATED_ENTRY_EXTENSIONS, '');
                }
                data = buildStatsEntrypoints[entry];
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
                .map((asset :Asset) => {
                    if (typeof asset === 'string') {
                        return asset;
                    }
                    if (typeof asset === 'object' && typeof asset.name === 'string') {
                        return asset.name
                    }

                    throw Error(`Unexpected 'assets' structure in ${COMPONENT_STATS_FILENAME}: ${JSON.stringify(data.assets)}`);
                })
                .filter((asset :string) => !asset.endsWith(".map") && asset !== myself)
                .forEach((asset :string) => {
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

	//log.debug('readComponentChunkNames() output:%s', toStr(output));
    return output;
}

const NO_SITE = "#NO_SITE_CONTEXT#";


export function getSiteLocalCacheKey(rawKey :string) {
    const siteKey = (getSite() || {})._id || NO_SITE;
    return `${siteKey}_*_${rawKey}`;
}


// Cached version of readComponentChunkNames - used in prod mode
function readComponentChunkNamesCached(entryNames :OneOrMore<React4xpNamespace.EntryName>) :Array<string> {
    entryNames = normalizeEntryNames(entryNames);

    const cacheKey = getSiteLocalCacheKey(entryNames.join("*"));
    return dependenciesCache.get(cacheKey, () => readComponentChunkNames(entryNames));
}


export function getComponentChunkNames(entryNames :OneOrMore<React4xpNamespace.EntryName>) {
	return IS_PRODMODE
    	? readComponentChunkNamesCached(entryNames)
    	: readComponentChunkNames(forceTrimmedArray(entryNames));
}


export function getComponentChunkUrls(entries :OneOrMore<React4xpNamespace.EntryName>) {
    return getComponentChunkNames(entries).map(name => getAssetRoot() + name);
}


/** Returns the asset-via-service URL for the externals chunk */
function readExternalsUrls() {
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
}


function readExternalsUrlsCached() {
    const cacheKey = getSiteLocalCacheKey(FULL_EXTERNALS_CHUNKS_FILENAME);
    return dependenciesCache.get(cacheKey, () => readExternalsUrls());
}

export const getExternalsUrls = IS_PRODMODE
    ? readExternalsUrlsCached
    : readExternalsUrls;


function readClientUrls() {
    // Special case: if there is a chunkfile for a client wrapper, use that. If not, fall back to
    // a reference to the built-in client wrapper service: _/services/{app.name}/react4xp-client
    try {
        return getNamesFromChunkfile(FULL_CLIENT_CHUNKS_FILENAME).map(
            name => getAssetRoot() + name
        );
    } catch (e) {
        log.debug('Stacktrace', e);
        log.debug(
            `No optional clientwrapper was found (chunkfile reference: ${FULL_CLIENT_CHUNKS_FILENAME}). That's okay, there's a fallback one at: ${getClientRoot()}`
        );
        return [getClientRoot()];
    }
}

/** Returns the asset-via-service URL for the frontend client */
function readClientUrlsCached() {
    const cacheKey = getSiteLocalCacheKey(FULL_CLIENT_CHUNKS_FILENAME);
    return dependenciesCache.get(cacheKey, () => readClientUrls());
}

export const getClientUrls = IS_PRODMODE
    ? readClientUrlsCached
    : readClientUrls;


export function getAllUrls(
	entries :OneOrMore<React4xpNamespace.EntryName>,
	suppressJS :boolean
) {
    return [
        ...getExternalsUrls(),
        ...getComponentChunkUrls(entries),
        ...suppressJS
            ? []
            : getClientUrls()
    ].filter(!suppressJS
        ? chunkUrl => chunkUrl
        : chunkUrl => !chunkUrl.endsWith(".js")
    );
}

/** Open a chunkfile, read the contents and return the domain-relative urls for non-entry JS file references in the chunk file.
 * Throws an error if not found or if unexpected format. */
export function getNamesFromChunkfile(chunkFile :string) {

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
        const resource = getResource(`/${R4X_TARGETSUBDIR}/${chunk}`);
        if (!resource || !resource.exists()) {
            throw Error(
                `React4xp dependency chunk not found: /${R4X_TARGETSUBDIR}/${chunk}`
            );
        }

        return chunk;
    });
}
