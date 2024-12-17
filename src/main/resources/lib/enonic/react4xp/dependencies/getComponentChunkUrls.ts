import type { UrlType } from '/lib/enonic/react4xp/types/React4xp';
import type {
	EntryName,
	OneOrMore,
} from '../../../../index.d';


import { getAssetRoot } from '/lib/enonic/react4xp/dependencies/getAssetRoot';
import { getComponentChunkNames } from '/lib/enonic/react4xp/dependencies/getComponentChunkNames';


// NOTE: This function is exported in ..React4xp.ts, so a major release is needed to change it's signature.
// TODO: Change to single param with two properties.
export function getComponentChunkUrls(entries: OneOrMore<EntryName>, {
	urlType // default is app.config['react4xp.urlType'] || 'server'
}: {
	urlType?: UrlType
} = {}) {
	return getComponentChunkNames(entries).map(name => getAssetRoot({ urlType }) + name);
}
