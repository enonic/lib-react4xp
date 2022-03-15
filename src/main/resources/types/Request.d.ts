export interface Request<
	Params extends {} = {},
	PathParams extends {} = {}
> {
	body? :string
	contextPath? :string
	headers? :{
		Accept? :string
		Authorization? :string
		'If-None-Match' ? :string
	}
	method? :string
	mode? :'edit'|'inline'|'live'|'preview'
	params? :Params
	path? :string
	pathParams? :PathParams
	rawPath? :string
}
