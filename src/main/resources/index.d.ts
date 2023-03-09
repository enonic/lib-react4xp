import {
	App,
	Log,
	DoubleUnderscore
} from './types/index.d';

export {
	//App,
	//Application,
	Cache,
	Component,
	ComponentGeneric,
	ComponentType,
	//Log,
	OneOrMore,
	PageContributions,
	React4xp,
	Request,
	Response,
	Resource,
	Stats,
	Stream
} from './types/index.d';

declare global {
	const Java :{
		type :(string :string) => ({
			get :() => void
		})
	}
}
