import {includes} from '@enonic/js-utils/array/includes';
import {
	COMPONENT_STATS_FILENAME,
	R4X_TARGETSUBDIR  // assets/react4xp
	//@ts-ignore
} from '/lib/enonic/react4xp/react4xp_constants.json';
import {
	getResource,
	readLines
	//@ts-ignore
} from '/lib/xp/io';


const REACT4XP_ROOT = `/${R4X_TARGETSUBDIR}/`;


export function getDependencies(entries :Array<string>) {
	const componentStats = JSON.parse(
	    readLines(getResource(REACT4XP_ROOT + COMPONENT_STATS_FILENAME).getStream())
	        .join(" ")
	);
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
