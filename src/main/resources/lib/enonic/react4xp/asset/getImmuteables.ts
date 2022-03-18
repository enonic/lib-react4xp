import {getDependencies} from './getDependencies';
import {getExternals} from './getExternals';


export function getImmuteables(entries :Array<string>) {
	const dependencies = getDependencies(entries); // includes entries with hash in filename?
	const externals = getExternals();
	//log.debug('handleAssetRequest externals:%s', toStr(externals));

	const immuteables = {};
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
