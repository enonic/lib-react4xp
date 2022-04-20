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
	const React4xp :{
		CLIENT :{
			hydrate :(
				component :object,
				id :string,
				props :object,
				isPage :'1'|'0'|1|0|boolean,
				hasRegions :'1'|'0'|1|0|boolean,
				devMode:'1'|'0'|1|0|boolean
			)=>void
			render :(
				component :object,
				id :string,
				props :object,
				isPage :'1'|'0'|1|0|boolean,
				hasRegions :'1'|'0'|1|0|boolean,
				devMode:'1'|'0'|1|0|boolean
			)=>void
		}
	}
}
