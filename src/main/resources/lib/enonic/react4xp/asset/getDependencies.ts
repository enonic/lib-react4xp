import {includes} from 'JS_UTILS_ALIAS/array/includes';
import {getComponentStats} from './getComponentStats';


export function getDependencies(entries :Array<string>) {
	const componentStats = getComponentStats();
	const entryNames = Object.keys(componentStats.entrypoints);
	const dependencies :Array<string> = [];
	for (let i = 0; i < entryNames.length; i++) {
	    const entryName = entryNames[i];
		const assets = componentStats.entrypoints[entryName].assets;
		//log.debug('handleAssetRequest assets:%s', toStr(assets));
		for (let j = 0; j < assets.length; j++) {
		    const asset = assets[j];
			//log.debug('handleAssetRequest asset:%s', toStr(asset));
			const {name: assetName} = asset;
			//log.debug('handleAssetRequest assetName:%s', toStr(assetName));
			if (
				!includes(entries, assetName)
				&& !includes(dependencies, assetName)
			) {
				dependencies.push(assetName);
			}
		}
	}
	return dependencies;
} // getDependencies
