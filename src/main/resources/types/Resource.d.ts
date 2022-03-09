export interface Resource {
	exists :() => boolean
	getStream :() => unknown
}
