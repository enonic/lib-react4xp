import type {PageContributions} from './PageContributions';


export interface Response {
	body? :string
	contentType? :string
	headers? :{
		'Content-Type'? :string
		'Cache-Control'? :string
		ETag? :string|number
	}
	pageContributions? :PageContributions
	status? :number
}
