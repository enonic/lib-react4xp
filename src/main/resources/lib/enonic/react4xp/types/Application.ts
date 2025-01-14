import type { UrlType } from './React4xp';


export interface AppConfig {
	'react4xp.hydrate'?: 'true'|'false'
	'react4xp.ssr'?: 'true'|'false'
	'react4xp.ssr.maxThreads'?: number|string|unknown
	'react4xp.urlType'?: UrlType
}
