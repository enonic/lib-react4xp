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
import {getAppConfigFilePathAbsolute} from '/lib/enonic/xp/getAppConfigFilePathAbsolute';
import {
	//getContent as getFileContent,
	readFile,
	writeFile as writeToFile
	//@ts-ignore
} from '/lib/openxp/file-system';
//@ts-ignore
import {newStream} from '/lib/xp/io';


const SSRreact4xp = __.newBean('com.enonic.lib.react4xp.ssr.ServerSideRenderer');

//const FULL_EXTERNALS_CHUNKS_FILENAME = `/${R4X_TARGETSUBDIR}/${EXTERNALS_CHUNKS_FILENAME}`;
const RESOURCE_PATH_RELATIVE_NASHORNPOLYFILLS_USERADDED = `${FILE_STEM_NASHORNPOLYFILLS_USERADDED}.js`;

const absoluteFilePath = getAppConfigFilePathAbsolute();
//log.debug(`absoluteFilePath:%s exists`, absoluteFilePath);

const file = readFile(absoluteFilePath);
//log.debug(`file.absolutePath:%s exists`, file.absolutePath); // This is null when file doesn't exist!

if (!file.exists) {
	//log.debug(`filePath:%s does NOT exists`, absoluteFilePath);
	//const created =
	writeToFile(absoluteFilePath, newStream(`
# Overrides SSR lazy dependency loading. If not overridden (aka, if commented
# out below), it depends on build mode (buildEnv above): true in dev, false in
# prod.
#
# If false: all assets are loaded into the SSR engine as soon as it's
#  initialized (on the first SSR): nashornpolyfills, externals, vendors,
#  dependency chunks, react4xp-regions and entries, in that order.
#  Fixed engine warm-up time, no further warm-up after initialization.
#
# If true: only nashornpolyfills and externals assets are loaded on engine
#  initialization. Each entry and its dependency assets are loaded (and cached
#  for shared re-use across entries) only the first time that entry is rendered,
#  instead of loading everything on app startup. Here, initial engine warm-up
#  time is shorter than without lazy-loading, and depends on which entry is
#  rendered first but the next entry rendering might require some more asset
#  loading the first time THAT is rendered, etc.
#
# react4xp.ssr.lazyLoad = true


# Override the maximum SSR thread/engine count.
#
# Default value (if commented out): null, which means no limit on number of
# threads. If set as a number above 0, limits the number of SSR engines that are
# available for simultaneous server-side rendering.
#
# It's usually not necessary to set a limit on this, the java thread model will
# limit it to the amount of available cores (and maybe multiplied, depending on
# CPU hyperthreading etc).
# However, each SSR engine will load the assets it needs for rendering into
# memory, in its own independent nashorn engine and memory space.
# And for performance reasons, these engines will be re-used as much as
# possible, trying to avoid initializing new engines.
# In other words, the memory used will NOT be cleared and made available after a
# rendering, but the engines will keep already-loaded assets in memory. And in
# the long run, the result will probably be that every engine will keep every
# compiled react asset in memory.
# If this ever becomes a problem, the ssrMaxThreads can be used to set a limit
# on this.
#
# react4xp.ssr.maxThreads = 0


# Override SSR engine settings.
# Ref:
# https://github.com/openjdk/nashorn/blob/main/src/org.openjdk.nashorn/share/
# classes/org/openjdk/nashorn/internal/runtime/resources/Options.properties
#
# Default settings (if commented out) is:
#  1000
#  This corresponds to:
#  --persistent-code-cache, --class-cache-size=1000
# If only a number, changes the the number in --class-cache-size=<number> in the
# default setting above.
# If that number is set to 0 (or less), persistent code cache is switched off.
# Might affect performance positively or negatively, depending on your project.
# If a full string (more than just a number): completely overrides the default
# settings.
#  Interpreted as a comma-separated list of settings, same format as the default settings above, for example:
#  --persistent-code-cache, --class-cache-size=42, --lazy-compilation
#
# react4xp.ssr.settings = 0
`));
	//log.debug(`created:%s`, created);
}
//const fileContent = getFileContent(file);
//log.debug(`fileContent:%s`, fileContent);

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
