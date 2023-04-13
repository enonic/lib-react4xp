import type {PageContributions} from './PageContributions';


// https://developer.enonic.com/docs/xp/stable/framework/http#http-response
export interface ComplexCookie {
	value: string // Value (required) The value to store in the cookie. This example will create a cookie looking like this complex: value.
	path?: string // The paths on the site where this cookie should be available from (and all containing paths). Defaults to empty
	domain?: string // Add additional sites that should be able to read the cookie. Defaults to empty (Only the server that creates the cookie can read it.)
	comment?: string // A comment describing the cookie. Default to `null. Deprecated and will be removed in future versions of XP.
	maxAge?: number // Number of seconds before the browser is allowed to delete the cookie. Defaults to -1 (The cookie will live until the browser is shut down.)
	secure?: boolean // Control if the cookie should only be accepted to be created and read over https and similar secure protocols. Defaults to false
	httpOnly?: boolean // Control if the cookie is available for scripts or not. If true, only the serverside code can read the cookie. Defaults to false (Also client-side scripts can read the cookie.)
	sameSite?: string // XP 7.3.0 SameSite flag for the cookie. Can be lax, strict, none or   for "not set". Default is "not set", meaning "browser’s default".
}

export interface Response<
	Body = string,
	Headers extends Record<string,string> = {
		'Content-Type'?: string
		'Cache-Control'?: string
		ETag?: string|number
	}
> {
	applyFilters?: boolean
	body?: Body
	contentType?: string
	cookies?: Record<string,string|ComplexCookie>
	headers?: Headers
	pageContributions?: PageContributions
	postProcess?: boolean
	redirect?: string
	status?: number
}
