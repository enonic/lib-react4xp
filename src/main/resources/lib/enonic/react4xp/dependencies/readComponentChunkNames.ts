import type {
	OneOrMore,
	React4xp as React4xpNamespace
} from '../../../../index.d';


import endsWith from '@enonic/js-utils/string/endsWith';
//import {toStr} from '@enonic/js-utils/value/toStr';
import {COMPONENT_STATS_FILENAME} from '@enonic/react4xp/constants.runtime';
import {getComponentStats} from '/lib/enonic/react4xp/asset/getComponentStats';


type Asset = string|{name :string};


// Tolerate and remove file extensions ts(x), js(x), es(6) and/or trailing slash or space
const TOLERATED_ENTRY_EXTENSIONS = /([/ ]+|\.(tsx?|jsx?|es6?)[/ ]*)$/i;


let buildStatsEntrypoints :Object|undefined;


/** Takes entry names (array or a single string) and returns an array of (hashed) dependency file names, the complete set of chunks required for the set of entries to run.
 *  ASSUMES that stats.json.entrypoints is an object where the keys are entry names without file extensions, mapping to values that are objects,
 *  which in turn have an "assets" key, under which are the full file names of the entry's dependencies.
 *  If the input array is empty or null, returns ALL dependency chunk names. */
export function readComponentChunkNames(entryNames :OneOrMore<React4xpNamespace.EntryName>) {
	//log.debug('readComponentChunkNames(%s)', toStr(entryNames));

    // Just verify that it exists and has a content:
    let STATS = getComponentStats();

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

                    throw new Error(`Unexpected 'assets' structure in ${COMPONENT_STATS_FILENAME}: ${JSON.stringify(data.assets)}`);
                })
                .filter((asset :string) => !endsWith(asset, ".map"))
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
        throw new Error(
            `Couldn't find dependencies for ${missing.length} entries: '${missing.join(', ')}'`
        );
    }

	//log.debug('readComponentChunkNames() output:%s', toStr(output));
    return output;
}
