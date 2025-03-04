import type {UrlType} from '/lib/enonic/react4xp/types/React4xp';
import type {EntryName, OneOrMore} from '../../../../index.d';


import {getAssetRoot} from '/lib/enonic/react4xp/dependencies/getAssetRoot';
import {getComponentChunkNames} from '/lib/enonic/react4xp/dependencies/getComponentChunkNames';


// NOTE: This function is exported in ..React4xp.ts, so a major release is needed to change it's signature.
export function getComponentChunkUrls({
										  entries,
	urlType // default is app.config['react4xp.urlType'] || 'server'
}: {
	entries: OneOrMore<EntryName>,
	urlType?: UrlType
}) {
	return getComponentChunkNames(entries).map(name => getAssetRoot({ urlType }) + name);
}
