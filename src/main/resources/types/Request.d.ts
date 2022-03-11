export interface Request<
	Params extends {} = {},
	PathParams extends {} = {}
> {
	body? :string
	headers? :{
		Accept? :string
		Authorization? :string
	}
	method? :string
	mode? :'edit'|'inline'|'live'|'preview'
	params? :Params
	path? :string
	pathParams? :PathParams
}
