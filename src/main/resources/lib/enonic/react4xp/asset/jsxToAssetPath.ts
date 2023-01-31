import {toStr} from 'JS_UTILS_ALIAS/value/toStr';
import {getComponentStats} from '/lib/enonic/react4xp/asset/getComponentStats';


export function jsxToAssetPath(jsxPath :string) {
	const componentStats = getComponentStats();
	const entryNames = Object.keys(componentStats.entrypoints);
	entryLoop: for (let i = 0; i < entryNames.length; i++) {
		const entryName = entryNames[i];
		if (entryName !== jsxPath) {
			continue entryLoop;
		}

		const assets = componentStats.entrypoints[entryName].assets;

		assetsLoops: for (let k = 0; k < assets.length; k++) {
			const {name} = assets[k];
			if (!(name.startsWith(jsxPath) && name.endsWith('.js'))) {
				continue assetsLoops;
			}
			return name;
		} // assetsLoops
		throw new Error(`Unable to find entry:${entryName} in assets:${toStr(assets)}`);

	} // entryLoop
	throw new Error(`Unable to find assetPath for jsxPath:${jsxPath} in componentStats:${toStr(componentStats)}`);
}
