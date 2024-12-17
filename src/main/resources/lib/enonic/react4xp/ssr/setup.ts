import type { AppConfig } from '/types';
import {
	COMPONENT_STATS_FILENAME,
	ENTRIES_FILENAME,
	GLOBALS_FILENAME,
	LIBRARY_NAME,
	R4X_TARGETSUBDIR
} from '@enonic/react4xp';
import {camelize} from '@enonic/js-utils/string/camelize';
import {ucFirst} from '@enonic/js-utils/string/ucFirst';
import {isSet} from '@enonic/js-utils/value/isSet';
// import {toStr} from '@enonic/js-utils/value/toStr';
import {normalizeSSRMaxThreads} from '/lib/enonic/react4xp/ssr/normalizeSSRMaxThreads';
// import {getResource} from '/lib/enonic/react4xp/resource/getResource';
import SSRreact4xp from '/lib/enonic/react4xp/ssr/SSRreact4xp';

// const FULL_GLOBALS_CHUNKS_FILENAME = `/${R4X_TARGETSUBDIR}/${GLOBALS_FILENAME}`;

const appConfig = app.config as AppConfig;
// log.debug(`appConfig:%s`, appConfig);

const SSR_MAX_THREADS = appConfig['react4xp.ssr.maxThreads'];
// log.debug(`SSR_MAX_THREADS:%s`, SSR_MAX_THREADS);

const SSR_ENGINE_SETTINGS = appConfig['react4xp.ssr.settings'];
// log.debug(`SSR_ENGINE_SETTINGS:%s`, SSR_ENGINE_SETTINGS);

const SSR_ENGINE_NAME = appConfig['react4xp.ssr.engineName'];

// const resourceChunksGlobalsJson = getResource(FULL_GLOBALS_CHUNKS_FILENAME);
// const booleanChunksGlobalsJsonExist = resourceChunksGlobalsJson && resourceChunksGlobalsJson.exists();


export function setup({
		ssrMaxThreads
}: {
	scriptEngineSettings?: string[],
	ssrMaxThreads?: number
} = {}) {
	// log.debug('setup ssrMaxThreads:%s', toStr(ssrMaxThreads));
	const appName = ucFirst(camelize(app.name,/\./g));
	return SSRreact4xp.setup(
		app.name,
		`/${R4X_TARGETSUBDIR}`, // scriptsHome,
		`${appName}${LIBRARY_NAME}`,
		`/${R4X_TARGETSUBDIR}/`, // chunkfilesHome,
		ENTRIES_FILENAME,

		// booleanChunksGlobalsJsonExist ? GLOBALS_CHUNKS_FILENAME : '',
		GLOBALS_FILENAME,

		COMPONENT_STATS_FILENAME,
		normalizeSSRMaxThreads(isSet(ssrMaxThreads)
			? ssrMaxThreads
			: SSR_MAX_THREADS
		),
		__.nullOrValue(SSR_ENGINE_NAME)
	);
}
