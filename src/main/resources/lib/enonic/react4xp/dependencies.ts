import type {
	OneOrMore,
	//PageContributions,
	React4xp as React4xpNamespace
} from '../../../index.d';

import {
	CLIENT_CHUNKS_FILENAME,
    COMPONENT_STATS_FILENAME,
	R4X_TARGETSUBDIR
} from '@enonic/react4xp';
//import {isString} from '@enonic/js-utils';
import {isString} from '@enonic/js-utils/value/isString';
//import {toStr} from '@enonic/js-utils/value/toStr';

import {dependenciesCache} from '/lib/enonic/react4xp/asset/dependenciesCache';
import {getSiteLocalCacheKey} from '/lib/enonic/react4xp/asset/getSiteLocalCacheKey';
import {getNamesFromChunkfile} from '/lib/enonic/react4xp/chunk/getNamesFromChunkfile';
import {getExternalsUrls} from '/lib/enonic/react4xp/asset/externals/getExternalsUrls';
import {readResourceAsJson} from '/lib/enonic/react4xp/resource/readResourceAsJson';
import {
	getAssetRoot,
	getClientRoot
} from '/lib/enonic/react4xp/serviceRoots';
import {IS_PROD_MODE} from '/lib/enonic/xp/runMode';


type Asset = string|{name :string};


// Tolerate and remove file extensions ts(x), js(x), es(6) and/or trailing slash or space
const TOLERATED_ENTRY_EXTENSIONS = /([/ ]+|\.(tsx?|jsx?|es6?)[/ ]*)$/i;

let buildStatsEntrypoints :Object|undefined;



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


// Cached version of readComponentChunkNames - used in prod mode
function readComponentChunkNamesCached(entryNames :OneOrMore<React4xpNamespace.EntryName>) :Array<string> {
    entryNames = normalizeEntryNames(entryNames);

    const cacheKey = getSiteLocalCacheKey(entryNames.join("*"));
    return dependenciesCache.get(cacheKey, () => readComponentChunkNames(entryNames));
}


export function getComponentChunkNames(entryNames :OneOrMore<React4xpNamespace.EntryName>) {
	return IS_PROD_MODE
    	? readComponentChunkNamesCached(entryNames)
    	: readComponentChunkNames(forceTrimmedArray(entryNames));
}


export function getComponentChunkUrls(entries :OneOrMore<React4xpNamespace.EntryName>) {
    return getComponentChunkNames(entries).map(name => getAssetRoot() + name);
}


function readClientUrls() {
	//log.debug('readClientUrls()');
    // Special case: if there is a chunkfile for a client wrapper, use that. If not, fall back to
    // a reference to the built-in client wrapper service: _/services/{app.name}/react4xp-client
    try {
        return getNamesFromChunkfile(FULL_CLIENT_CHUNKS_FILENAME).map(
            name => getAssetRoot() + name
        );
    } catch (e) {
        //log.debug('Stacktrace', e); // Error: Empty or not found: /assets/react4xp/chunks.client.json
        log.debug(
            `No optional clientwrapper was found (chunkfile reference: ${FULL_CLIENT_CHUNKS_FILENAME}). That's okay, there's a fallback one at: ${getClientRoot()}`
        );
        return [getClientRoot()];
    }
}

/** Returns the asset-via-service URL for the frontend client */
function readClientUrlsCached() {
	//log.debug('readClientUrlsCached()');
    const cacheKey = getSiteLocalCacheKey(FULL_CLIENT_CHUNKS_FILENAME);
    return dependenciesCache.get(cacheKey, () => readClientUrls());
}

export const getClientUrls = IS_PROD_MODE
    ? readClientUrlsCached
    : readClientUrls;


export function getAllUrls(
	entries :OneOrMore<React4xpNamespace.EntryName>,
	suppressJS :boolean
) {
	//log.debug('getAllUrls() entries:%s', toStr(entries));
	//log.debug('getAllUrls() suppressJS:%s', toStr(suppressJS));
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
