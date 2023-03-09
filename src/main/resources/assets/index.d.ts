declare global {
	const React4xp: {
		CLIENT: {
			hydrate: (
				component: object,
				id: string,
				props: object,
				isPage: '1'|'0'|1|0|boolean,
				hasRegions: '1'|'0'|1|0|boolean,
				devMode:'1'|'0'|1|0|boolean
			) => void
			render: (
				component: object,
				id: string,
				props: object,
				isPage: '1'|'0'|1|0|boolean,
				hasRegions: '1'|'0'|1|0|boolean,
				devMode:'1'|'0'|1|0|boolean
			) => void
		}
	}
}

// At least one export is needed according to the docs
// https://www.typescriptlang.org/docs/handbook/declaration-files/templates/global-modifying-module-d-ts.html#identifying-global-modifying-modules
export {}
