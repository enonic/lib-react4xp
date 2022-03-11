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
	Resource
} from './types/index.d';


// Global-modifying module, should be placed in moduleRoot/index.d.ts
declare global {
	const __ :DoubleUnderscore;
	const app :App;
	const log :Log;
	const Java :{
		type :(string :string) => ({
			get :() => void
		})
	}
}
