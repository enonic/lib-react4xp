export interface Stats {
	// outputPath: string
	assetsByChunkName: Record<string, string[]>
	assets: {
		info: {
			sourceFilename?: string
			immutable?: boolean
			javascriptModule?: boolean
			contenthash?: string
		}
		name: string
	}[]
	entrypoints: {
		[entry: string]: {
			// name: string

			// https://webpack.js.org/configuration/optimization/#optimizationchunkids
			// deterministic: Short numeric ids which will not be changing between compilation. Good for long term caching. Enabled by default for production mode.
			// named: Readable ids for better debugging.
			// In Webpack 4 the default was named
			// In Webpack 5 the default is deterministic
			// chunks: (number|string)[]

			assets: {
				name: string
				// size?: number
			}[]
			// filteredAssets: number
			// assetsSize: number|null
			auxiliaryAssets: {
				name: string
				// size?: number
			}[]
			// filteredAuxiliaryAssets: number
			// auxiliaryAssetsSize: number|null
			// children: object
			// childAssets: object
		}
	}
	errors: unknown[]
	errorsCount: number
	warnings: unknown[]
	warningsCount: number
}
