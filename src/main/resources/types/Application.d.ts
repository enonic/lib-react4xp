export interface AppConfig {
	'react4xp.hydrate'?: 'true'|'false'
	'react4xp.ssr'?: 'true'|'false'
	'react4xp.ssr.lazyLoad'?: 'true'|'false'
	'react4xp.ssr.maxThreads'?: number|string|unknown
	'react4xp.ssr.settings'?: string
	'react4xp.ssr.engineName'?: 'Graal.js'|'Nashorn'
}
