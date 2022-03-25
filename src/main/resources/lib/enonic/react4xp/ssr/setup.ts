import {
	COMPONENT_STATS_FILENAME,
    ENTRIES_FILENAME,
	EXTERNALS_CHUNKS_FILENAME,
	FILE_STEM_NASHORNPOLYFILLS_USERADDED,
	LIBRARY_NAME,
	R4X_TARGETSUBDIR
} from '@enonic/react4xp';
import {isSet} from '@enonic/js-utils/value/isSet';
import {toStr} from '@enonic/js-utils/value/toStr';
import {readRuntimeSettings} from '/lib/enonic/react4xp/asset/readRuntimeSettings';
import {exists} from '/lib/enonic/react4xp/resource/exists';
import {
	normalizeSSREngineSettings,
	normalizeSSRMaxThreads
}  from '/lib/enonic/react4xp/normalizing';
//import {getResource} from '/lib/enonic/react4xp/resource/getResource';

const SSRreact4xp = __.newBean('com.enonic.lib.react4xp.ssr.ServerSideRenderer');

//const FULL_EXTERNALS_CHUNKS_FILENAME = `/${R4X_TARGETSUBDIR}/${EXTERNALS_CHUNKS_FILENAME}`;
const RESOURCE_PATH_RELATIVE_NASHORNPOLYFILLS_USERADDED = `${FILE_STEM_NASHORNPOLYFILLS_USERADDED}.js`;
const SSR_DEFAULT_CACHE_SIZE = 0;

//const resourceChunksExternalsJson = getResource(FULL_EXTERNALS_CHUNKS_FILENAME);
//const booleanChunksExternalsJsonExist = resourceChunksExternalsJson && resourceChunksExternalsJson.exists();

export function render(
	entryName :string,
	props :string, // JSONstring object
	dependencyNames :string // JSONstring array
) {
	//log.debug('render entryName:%s', toStr(entryName));
	//log.debug('render props:%s', toStr(props));
	//log.debug('render dependencyNames:%s', toStr(dependencyNames));
	//@ts-ignore
	return SSRreact4xp.render(
		entryName,
		props,
		dependencyNames
	);
}


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

	const runtimeSettings = readRuntimeSettings();
	log.debug('setup runtimeSettings:%s', toStr(runtimeSettings));

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
		isSet(lazyload) ? lazyload : runtimeSettings.SSR_LAZYLOAD,
		normalizeSSRMaxThreads(isSet(ssrMaxThreads) ? ssrMaxThreads : runtimeSettings.SSR_MAX_THREADS),
		normalizeSSREngineSettings(
			runtimeSettings.SSR_ENGINE_SETTINGS,
			SSR_DEFAULT_CACHE_SIZE
		)
	);
}
