export interface Stats {
	outputPath :string
	entrypoints :{
		[entry :string] :{
			name :string
			chunks :Array<string>
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
