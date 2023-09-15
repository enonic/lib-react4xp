import type {
	OneOrMore,
	React4xp as React4xpNamespace
} from '../../../../index.d';


import { getAssetRoot } from '/lib/enonic/react4xp/dependencies/getAssetRoot';
import { getComponentChunkNames } from './getComponentChunkNames';


// NOTE: This function is exported in ..React4xp.ts, so a major release is needed to change it's signature.
// TODO: Change to single param with two properties.
export function getComponentChunkUrls(entries: OneOrMore<React4xpNamespace.EntryName>, {
	urlType // default is app.config['react4xp.urlType'] || 'server'
}: {
	urlType?: 'server' | 'absolute'
} = {}) {
	return getComponentChunkNames(entries).map(name => getAssetRoot({ urlType }) + name);
}
