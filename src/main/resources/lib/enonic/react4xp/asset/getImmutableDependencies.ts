import {includes} from '@enonic/js-utils/array/includes';
import endsWith from '@enonic/js-utils/string/endsWith';
import { startsWith } from '@enonic/js-utils/string/startsWith';
// import {toStr} from '@enonic/js-utils/value/toStr';
import {getComponentStats} from './getComponentStats';


export function getImmutableDependencies(entries: string[]): string[] {
	// log.debug('getImmutableDependencies entries:%s', toStr(entries));

	const componentStats = getComponentStats();
	// log.debug('getImmutableDependencies componentStats:%s', toStr(componentStats));

	const immutables: Record<string, boolean> = {};
	const chunkNames = Object.keys(componentStats.assetsByChunkName);
	// log.debug('getImmutableDependencies chunkNames:%s', toStr(chunkNames));

	for (let i = 0; i < chunkNames.length; i++) {
		const chunkName = chunkNames[i];
		// log.debug('getImmutableDependencies chunkName:%s', chunkName);

		const assets = componentStats.assetsByChunkName[chunkName];
		// log.debug('getImmutableDependencies assets:%s', toStr(assets));

		for (let j = 0; j < assets.length; j++) {
			const asset = assets[j];
			// log.debug('getImmutableDependencies asset:%s', asset);
			if (
				endsWith(asset, '.js')
				&& startsWith(asset, chunkName)
				// Remove '.js' from asset name and compare with NOT chunkName.
				&& asset.substring(0, asset.length - 3) !== chunkName
			) {
				immutables[asset] = true;
			}
		} // for assetsByChunkName[chunkName].assets

	} // for chunkNames
	// log.debug('getImmutableDependencies immutables:%s', toStr(immutables));

	// I think these will always be the same as the entries function param,
	// but I guess it's "safer" to use the object one is iterating.
	const entryNames = Object.keys(componentStats.entrypoints);
	// log.debug('getImmutableDependencies entryNames:%s', toStr(entryNames));

	const dependencies: string[] = [];

	for (let i = 0; i < entryNames.length; i++) {
		const entryName = entryNames[i];

		// js, css (not map files though)
		const assets = componentStats.entrypoints[entryName].assets;
		//log.debug('handleAssetRequest assets:%s', toStr(assets));

		for (let j = 0; j < assets.length; j++) {
			const asset = assets[j];
			//log.debug('handleAssetRequest asset:%s', toStr(asset));
			const {name: assetName} = asset;
			// log.debug('handleAssetRequest assetName:%s', toStr(assetName));
			if (
				!includes(entries, assetName)
				&& immutables[assetName]
				&& !includes(dependencies, assetName) // avoid duplicates
			) {
				dependencies.push(assetName);
			}
		} // for entrypoints.[entryName].assets

	} // for entryNames

	// log.debug('getImmutableDependencies entries:%s -> dependencies:%s', toStr(entries), toStr(dependencies));
	return dependencies;
} // getImmutableDependencies
