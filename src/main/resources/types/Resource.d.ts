import type {Stream} from './Stream.d';


export interface Resource {
	exists :() => boolean
	getStream :() => Stream
	getSize :() => number
}
