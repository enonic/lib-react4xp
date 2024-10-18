import {includes} from '@enonic/js-utils/array/includes';
import endsWith from '@enonic/js-utils/string/endsWith';
import { startsWith } from '@enonic/js-utils/string/startsWith';
// import {toStr} from '@enonic/js-utils/value/toStr';
import {getComponentStats} from '/lib/enonic/react4xp/asset/getComponentStats';


const hasContentHash = ({
	assetName,
	extension,
	chunkName
}: {
	assetName: string
	extension: string
	chunkName: string
}): boolean => endsWith(assetName, extension)
	&& startsWith(assetName, chunkName)
	&& assetName.substring(0, assetName.length - extension.length) !== chunkName;

export function getImmutableDependencies(entries: string[]): string[] {
	// log.debug('getImmutableDependencies entries:%s', toStr(entries));

	const componentStats = getComponentStats();
	// log.debug('getImmutableDependencies componentStats:%s', toStr(componentStats));

	const immutables: Record<string, boolean> = {};

	if (
		componentStats.assets
		&& componentStats.assets.length
		&& componentStats.assets[0].info
		&& componentStats.assets[0].name
	) {
		for (let i = 0; i < componentStats.assets.length; i++) {
			const {
				info: {
					immutable = false
				} = {},
				name
			} = componentStats.assets[i];
			if (immutable) {
				immutables[name] = true;
			}
		}
	} else { // Fall back to old way
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
					hasContentHash({assetName: asset, extension: '.js', chunkName})
					|| hasContentHash({assetName: asset, extension: '.css', chunkName})
				) {
					immutables[asset] = true;
				}
			} // for assetsByChunkName[chunkName].assets

		} // for chunkNames
	}
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

		const auxiliaryAssets = componentStats.entrypoints[entryName].auxiliaryAssets;

		for (let i = 0; i < auxiliaryAssets.length; i++) {
			const asset = auxiliaryAssets[i];
			// log.debug('handleAssetRequest asset:%s', toStr(asset));
			const {name: assetName} = asset;
			// log.debug('handleAssetRequest assetName:%s', toStr(assetName));
			if (
				!includes(entries, assetName)
				&& immutables[assetName]
				&& !includes(dependencies, assetName) // avoid duplicates
			) {
				dependencies.push(assetName);
			}
		} // for entrypoints.[entryName].auxiliaryAssets

	} // for entryNames

	// log.debug('getImmutableDependencies entries:%s -> dependencies:%s', toStr(entries), toStr(dependencies));
	return dependencies;
} // getImmutableDependencies
