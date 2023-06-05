export interface Request<
	Params extends Record<string, string> = Record<string, string>,
	PathParams extends Record<string, string> = Record<string, string>
> {
	body?: string
	contextPath?: string
	headers?: {
		Accept?: string
		Authorization?: string
		'If-None-Match'?: string
	}
	host?: string
	method?: string
	mode?: 'edit'|'inline'|'live'|'preview'
	params?: Params
	path?: string
	pathParams?: PathParams
	rawPath?: string
}
