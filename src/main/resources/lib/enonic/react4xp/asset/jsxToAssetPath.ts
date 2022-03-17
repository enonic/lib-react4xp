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
		let indexOfEntry = -1;
		chunksLoop: for (let j = 0; j < chunks.length; j++) {
		    const chunkName = chunks[j];
			if (chunkName === entryName) {
				indexOfEntry = j;
				break chunksLoop;
			}
		} // for chunks
		if (indexOfEntry === -1) {
			throw new Error(`Unable to find entry:${entryName} in chunks:${toStr(chunks)}`);
		}

		const assets = componentStats.entrypoints[entryName].assets;
		return assets[indexOfEntry].name;
	} // for entryNames
	throw new Error(`Unable to find assetPath for jsxPath:${jsxPath} in componentStats:${toStr(componentStats)}`);
}
