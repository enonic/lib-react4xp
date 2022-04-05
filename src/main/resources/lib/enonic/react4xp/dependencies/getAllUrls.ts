import type {
	OneOrMore,
	React4xp as React4xpNamespace
} from '../../../../index.d';


import {getClientUrl} from '/lib/enonic/react4xp/asset/client/getClientUrl';
import {getExternalsUrls} from '/lib/enonic/react4xp/asset/externals/getExternalsUrls';
import {getComponentChunkUrls} from '/lib/enonic/react4xp/dependencies/getComponentChunkUrls';


export function getAllUrls({
	entries,
	suppressJS,
	serveExternals = true
} :{
	entries :OneOrMore<React4xpNamespace.EntryName>,
	suppressJS :boolean,
	serveExternals? :boolean
}) {
	//log.debug('getAllUrls() entries:%s', toStr(entries));
	//log.debug('getAllUrls() suppressJS:%s', toStr(suppressJS));
    return [
        ...(serveExternals ? getExternalsUrls() : []),
        ...getComponentChunkUrls(entries),
        ...suppressJS
            ? []
            : [getClientUrl()]
    ].filter(!suppressJS
        ? chunkUrl => chunkUrl
        : chunkUrl => !chunkUrl.endsWith('.js')
    );
}
