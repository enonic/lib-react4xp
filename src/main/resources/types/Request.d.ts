export interface Request<
	Params extends Record<string, string> = Record<string, string>,
	PathParams extends Record<string, string> = Record<string, string>
> {
	body?: string
	contextPath?: string
	headers?: { // HTTP/2 uses lowercase header keys
		accept?: string
		authorization?: string
		'if-none-match'?: string
	}
	host?: string
	method?: string
	mode?: 'edit'|'inline'|'live'|'preview'
	params?: Params
	path?: string
	pathParams?: PathParams
	rawPath?: string
}
