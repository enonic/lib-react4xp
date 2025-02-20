export {
	Cache,
	ComponentType,
	EntryName,
	OneOrMore,
	Stats
} from './types/index.d';

declare global {
	const Java :{
		type :(string :string) => ({
			get :() => void
		})
	}
}
