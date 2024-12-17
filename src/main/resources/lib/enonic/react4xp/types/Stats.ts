export interface Stats {
	assetsByChunkName: Record<string, string[]>
	assets: {
		info: {
			immutable?: boolean // This is the only one that's kept when doing StatsWriterPlugin.transform.
		}
		name: string
	}[]
	entrypoints: {
		[entry: string]: {
			assets: {
				name: string
			}[]
			auxiliaryAssets: {
				name: string
			}[]
		}
	}
	errors: unknown[]
	errorsCount?: number // rspack removes this (in the next PR)
	warnings: unknown[]
	warningsCount?: number // rspack removes this (in the next PR)
}
