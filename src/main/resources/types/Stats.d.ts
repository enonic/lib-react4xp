export interface Stats {
	outputPath :string
	entrypoints :{
		[entry :string] :{
			name :string
			chunks :Array<string|number> // I must have changed something in the build system since they went fron strings to integers :(
			assets :Array<{
				name :string
				size? :number
			}>
			filteredAssets :number
			assetsSize :number|null
			auxiliaryAssets :Array<{
				name :string
				size? :number
			}>
			filteredAuxiliaryAssets :number
			auxiliaryAssetsSize :number|null
			children :{}
			childAssets :{}
		}
	}
	errors :Array<unknown>
	errorsCount :number
	warnings :Array<unknown>
	warningsCount :number
}
