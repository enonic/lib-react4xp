import {toStr} from '@enonic/js-utils/value/toStr';
import {getComponentStats} from '/lib/enonic/react4xp/asset/getComponentStats';


export function jsxToAssetPath(jsxPath :string) {
	const componentStats = getComponentStats();
	const entryNames = Object.keys(componentStats.entrypoints);
	entryLoop: for (let i = 0; i < entryNames.length; i++) {
		const entryName = entryNames[i];
		if (entryName !== jsxPath) {
			continue entryLoop;
		}

		const chunks = componentStats.entrypoints[entryName].chunks;
		/*
		let indexOfEntry = -1;
		chunksLoop: for (let j = 0; j < chunks.length; j++) {
		    const chunkName = chunks[j]; // NOTE: It used to be a string, but I must have changed something in the build system so now it's just an integer :(
			if (chunkName === entryName) {
				indexOfEntry = j;
				break chunksLoop;
			}
		} // chunksLoop
		if (indexOfEntry === -1) {
			throw new Error(`Unable to find entry:${entryName} in chunks:${toStr(chunks)}`);
		}*/

		const assets = componentStats.entrypoints[entryName].assets;
		//return assets[indexOfEntry].name; // See NOTE above, assuming last index for now
		return assets[chunks.length-1].name; // Assuming last index for now
	} // entryLoop
	throw new Error(`Unable to find assetPath for jsxPath:${jsxPath} in componentStats:${toStr(componentStats)}`);
}
