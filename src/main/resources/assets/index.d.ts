// At least one export is needed according to the docs
// https://www.typescriptlang.org/docs/handbook/declaration-files/templates/global-modifying-module-d-ts.html#identifying-global-modifying-modules
export type BooleanProp = '1' | '0' | 1 | 0 | boolean;

declare global {
	const React4xp: {
		CLIENT: {
			hydrate: (
				component: object,
				id: string,
				props: object,
				isPage: BooleanProp,
				hasRegions: BooleanProp,
				devMode: BooleanProp
			) => void
			render: (
				component: object,
				id: string,
				props: object,
				isPage: BooleanProp,
				hasRegions: BooleanProp,
				devMode: BooleanProp
			) => void
		}
	}
}
