//import {toStr} from '@enonic/js-utils/value/toStr';
import {getClientChunkFilename} from '/lib/enonic/react4xp/asset/client/getClientChunkFilename';
import {getExternals} from './getExternals';
import {getDependencies} from './getDependencies';


export function getImmuteables(entries :Array<string>) {
	const dependencies = getDependencies(entries); // includes entries with hash in filename?
	const externals = getExternals();
	const clientChunkFilename = getClientChunkFilename();
	//log.debug('handleAssetRequest clientChunkFilename:%s', toStr(clientChunkFilename));
	//log.debug('handleAssetRequest externals:%s', toStr(externals));

	const immuteables = {};
	immuteables[clientChunkFilename] = true;
	for (let i = 0; i < dependencies.length; i++) {
		const dependency = dependencies[i];
		immuteables[dependency] = true;
	}
	for (let i = 0; i < externals.length; i++) {
		const external = externals[i];
		immuteables[external] = true;
	}
	return immuteables;
}
