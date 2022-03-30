import type {
	OneOrMore,
	React4xp as React4xpNamespace
} from '../../../../index.d';


import {getAssetRoot} from '/lib/enonic/react4xp/serviceRoots';
import {getComponentChunkNames} from './getComponentChunkNames';


export function getComponentChunkUrls(entries :OneOrMore<React4xpNamespace.EntryName>) {
    return getComponentChunkNames(entries).map(name => getAssetRoot() + name);
}
