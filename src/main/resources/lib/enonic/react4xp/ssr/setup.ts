import {
	COMPONENT_STATS_FILENAME,
    ENTRIES_FILENAME,
	EXTERNALS_CHUNKS_FILENAME,
	FILE_STEM_NASHORNPOLYFILLS_USERADDED,
	LIBRARY_NAME,
	R4X_TARGETSUBDIR
} from '@enonic/react4xp';
import {isSet} from '@enonic/js-utils/value/isSet';
//import {toStr} from '@enonic/js-utils/value/toStr';
import {exists} from '/lib/enonic/react4xp/resource/exists';
import {normalizeSSREngineSettings}  from '/lib/enonic/react4xp/ssr/normalizeSSREngineSettings';
import {normalizeSSRMaxThreads} from '/lib/enonic/react4xp/ssr/normalizeSSRMaxThreads';
//import {getResource} from '/lib/enonic/react4xp/resource/getResource';


const SSRreact4xp = __.newBean('com.enonic.lib.react4xp.ssr.ServerSideRenderer');

//const FULL_EXTERNALS_CHUNKS_FILENAME = `/${R4X_TARGETSUBDIR}/${EXTERNALS_CHUNKS_FILENAME}`;
const RESOURCE_PATH_RELATIVE_NASHORNPOLYFILLS_USERADDED = `${FILE_STEM_NASHORNPOLYFILLS_USERADDED}.js`;


const appConfig = app.config;
//log.debug(`appConfig:%s`, appConfig);

const SSR_LAZYLOAD = appConfig['react4xp.ssr.lazyLoad']; // Can be undefined, default in java?
const SSR_MAX_THREADS = appConfig['react4xp.ssr.maxThreads']; // Can be undefined, default in java?
const SSR_ENGINE_SETTINGS = appConfig['react4xp.ssr.settings']; // Can be undefined, default in java?
//log.debug(`SSR_LAZYLOAD:%s`, SSR_LAZYLOAD);
//log.debug(`SSR_MAX_THREADS:%s`, SSR_MAX_THREADS);
//log.debug(`SSR_ENGINE_SETTINGS:%s`, SSR_ENGINE_SETTINGS);

//const resourceChunksExternalsJson = getResource(FULL_EXTERNALS_CHUNKS_FILENAME);
//const booleanChunksExternalsJsonExist = resourceChunksExternalsJson && resourceChunksExternalsJson.exists();


export function setup({
		lazyload,
		ssrMaxThreads
} :{
	lazyload? :boolean,
	scriptEngineSettings? :Array<string>,
	ssrMaxThreads? :number
} = {}) {
	//log.debug('setup lazyload:%s', toStr(lazyload));
	//log.debug('setup ssrMaxThreads:%s', toStr(ssrMaxThreads));

	//@ts-ignore
	return SSRreact4xp.setup(
		app.name,
		`/${R4X_TARGETSUBDIR}`, //scriptsHome,
		LIBRARY_NAME,
		`/${R4X_TARGETSUBDIR}/`, //chunkfilesHome,
		exists(RESOURCE_PATH_RELATIVE_NASHORNPOLYFILLS_USERADDED) ? RESOURCE_PATH_RELATIVE_NASHORNPOLYFILLS_USERADDED : '',
		ENTRIES_FILENAME,

		//booleanChunksExternalsJsonExist ? EXTERNALS_CHUNKS_FILENAME : '',
		EXTERNALS_CHUNKS_FILENAME,

		COMPONENT_STATS_FILENAME,
		isSet(lazyload) ? lazyload : SSR_LAZYLOAD,
		normalizeSSRMaxThreads(isSet(ssrMaxThreads) ? ssrMaxThreads : SSR_MAX_THREADS),
		normalizeSSREngineSettings(SSR_ENGINE_SETTINGS)
	);
}
