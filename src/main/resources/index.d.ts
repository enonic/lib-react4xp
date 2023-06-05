import type {ResourceKey} from '/lib/xp/io';
export {
	Cache,
	Component,
	ComponentGeneric,
	ComponentType,
	OneOrMore,
	PageContributions,
	React4xp,
	Request,
	Response,
	Stats,
} from './types/index.d';

declare global {
	const Java: {
		type: (string: string) => ({
			get: () => void,
			from: (resourcePath: string) => ResourceKey
		})
	}
}
