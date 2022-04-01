import type {PageContributions} from './PageContributions';


export interface Response<
	Body extends unknown = string
> {
	body? :Body
	contentType? :string
	headers? :{
		'Content-Type'? :string
		'Cache-Control'? :string
		ETag? :string|number
	}
	pageContributions? :PageContributions
	status? :number
}
