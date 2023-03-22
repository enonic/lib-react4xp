import type { AppConfig } from '/types/Application.d';
import {
	COMPONENT_STATS_FILENAME,
	ENTRIES_FILENAME,
	EXTERNALS_CHUNKS_FILENAME,
	LIBRARY_NAME,
	R4X_TARGETSUBDIR
} from '@enonic/react4xp';
import {camelize} from '@enonic/js-utils/string/camelize';
import {ucFirst} from '@enonic/js-utils/string/ucFirst';
import {isSet} from '@enonic/js-utils/value/isSet';
//import {toStr} from '@enonic/js-utils/value/toStr';
import {normalizeSSREngineSettings}  from '/lib/enonic/react4xp/ssr/normalizeSSREngineSettings';
import {normalizeSSRMaxThreads} from '/lib/enonic/react4xp/ssr/normalizeSSRMaxThreads';
//import {getResource} from '/lib/enonic/react4xp/resource/getResource';


import {SSRreact4xp} from './render';

//const FULL_EXTERNALS_CHUNKS_FILENAME = `/${R4X_TARGETSUBDIR}/${EXTERNALS_CHUNKS_FILENAME}`;

const appConfig = app.config as AppConfig;
//log.debug(`appConfig:%s`, appConfig);

const SSR_LAZYLOAD = appConfig['react4xp.ssr.lazyLoad'] === 'true';
const SSR_MAX_THREADS = appConfig['react4xp.ssr.maxThreads'];
const SSR_ENGINE_SETTINGS = appConfig['react4xp.ssr.settings'];
const SSR_ENGINE_NAME = appConfig['react4xp.ssr.engineName'];
//log.debug(`SSR_LAZYLOAD:%s`, SSR_LAZYLOAD);
//log.debug(`SSR_MAX_THREADS:%s`, SSR_MAX_THREADS);
//log.debug(`SSR_ENGINE_SETTINGS:%s`, SSR_ENGINE_SETTINGS);

//const resourceChunksExternalsJson = getResource(FULL_EXTERNALS_CHUNKS_FILENAME);
//const booleanChunksExternalsJsonExist = resourceChunksExternalsJson && resourceChunksExternalsJson.exists();


export function setup({
		lazyload,
		ssrMaxThreads
} :{
	lazyload?: boolean,
	scriptEngineSettings?: string[],
	ssrMaxThreads?: number
} = {}) {
	//log.debug('setup lazyload:%s', toStr(lazyload));
	//log.debug('setup ssrMaxThreads:%s', toStr(ssrMaxThreads));

	return SSRreact4xp.setup(
		app.name,
		`/${R4X_TARGETSUBDIR}`, //scriptsHome,
		`${ucFirst(camelize(app.name,/\./g))}${LIBRARY_NAME}`,
		`/${R4X_TARGETSUBDIR}/`, //chunkfilesHome,
		ENTRIES_FILENAME,

		//booleanChunksExternalsJsonExist ? EXTERNALS_CHUNKS_FILENAME : '',
		EXTERNALS_CHUNKS_FILENAME,

		COMPONENT_STATS_FILENAME,
		isSet(lazyload) ? lazyload : SSR_LAZYLOAD,
		normalizeSSRMaxThreads(isSet(ssrMaxThreads)
			? ssrMaxThreads
			: SSR_MAX_THREADS
		),
		__.nullOrValue(SSR_ENGINE_NAME),
		normalizeSSREngineSettings(SSR_ENGINE_SETTINGS)
	);
}
