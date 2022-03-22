import {
	COMPONENT_STATS_FILENAME,
    ENTRIES_FILENAME,
	EXTERNALS_CHUNKS_FILENAME,
	LIBRARY_NAME,
	R4X_TARGETSUBDIR
} from '@enonic/react4xp';
import {isSet} from '@enonic/js-utils/value/isSet';
import {toStr} from '@enonic/js-utils/value/toStr';
import {getNashornPolyfills} from '/lib/enonic/react4xp/chunk/getNashornPolyfills';
import {readRuntimeSettings} from '/lib/enonic/react4xp/asset/readRuntimeSettings';
import {
	normalizeSSREngineSettings,
	normalizeSSRMaxThreads
}  from '../normalizing';

const SSRreact4xp = __.newBean('com.enonic.lib.react4xp.ssr.ServerSideRenderer');


const NASHORNPOLYFILLS_FILENAME = getNashornPolyfills();
const SSR_DEFAULT_CACHE_SIZE = 0;


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
		scriptEngineSettings,
		ssrMaxThreads
} :{
	lazyload? :boolean,
	scriptEngineSettings? :Array<string>,
	ssrMaxThreads? :number
} = {}) {
	//log.debug('setup appName:%s', toStr(appName));
	//log.debug('setup lazyload:%s', toStr(lazyload));
	//log.debug('setup scriptEngineSettings:%s', toStr(scriptEngineSettings));
	//log.debug('setup ssrMaxThreads:%s', toStr(ssrMaxThreads));

	const runtimeSettings = readRuntimeSettings();
	log.debug('setup runtimeSettings:%s', toStr(runtimeSettings));

	//@ts-ignore
	return SSRreact4xp.setup(
		app.name,
		`/${R4X_TARGETSUBDIR}`, //scriptsHome,
		LIBRARY_NAME,
		`/${R4X_TARGETSUBDIR}/`, //chunkfilesHome,
		NASHORNPOLYFILLS_FILENAME,
		ENTRIES_FILENAME,
		EXTERNALS_CHUNKS_FILENAME,
		COMPONENT_STATS_FILENAME,
		isSet(lazyload) ? lazyload : runtimeSettings.SSR_LAZYLOAD,
		normalizeSSRMaxThreads(isSet(ssrMaxThreads) ? ssrMaxThreads : runtimeSettings.SSR_MAX_THREADS),
		normalizeSSREngineSettings(isSet(scriptEngineSettings) ? scriptEngineSettings : runtimeSettings.SSR_ENGINE_SETTINGS, SSR_DEFAULT_CACHE_SIZE)
	);
}
