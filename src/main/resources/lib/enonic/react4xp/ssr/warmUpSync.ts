import {
	COMPONENT_STATS_FILENAME,
    ENTRIES_FILENAME,
	EXTERNALS_CHUNKS_FILENAME,
	LIBRARY_NAME
} from '@enonic/react4xp';

import {
	normalizeSSREngineSettings,
	normalizeSSRMaxThreads
}  from '../normalizing';
import {setup} from './setup'

// react4xp_constants.json is not part of lib-react4xp:
// it's an external shared-constants file expected to exist in the build directory of this index.es6.
// Easiest: use <projectRoot>/react4xp.properties and the build.gradle from https://www.npmjs.com/package/react4xp
import {
    R4X_TARGETSUBDIR,
    NASHORNPOLYFILLS_FILENAME,
    //SSR_LAZYLOAD,                   // <-- lazyLoading main switch: true/false
    SSR_MAX_THREADS,                // <-- set to 0/undefined/null for unlimited, otherwise a number for an upper concurrency limit (to save memory)
    SSR_ENGINE_SETTINGS,            // <-- set to 0 to switch off nashorn cache, otherwise cache size (number) or full settings (comma-separated string referring to https://github.com/openjdk/nashorn/blob/main/src/org.openjdk.nashorn/share/classes/org/openjdk/nashorn/internal/runtime/resources/Options.properties )
	//@ts-ignore
} from '/lib/enonic/react4xp/react4xp_constants.json';
// TODO: The above (require) doesn't seem to handle re-reading updated files in XP dev runmode. Is that necessary? If so, use dependencies.readResourceAsJson instead!


const SSR_DEFAULT_CACHE_SIZE = 0;


export function warmUpSync() {
	setup({
		appName: app.name,
		chunkfilesHome: `/${R4X_TARGETSUBDIR}/`,
		chunksExternalsJsonFilename: EXTERNALS_CHUNKS_FILENAME,
		entriesJsonFilename: ENTRIES_FILENAME,
		lazyload: false,
		libraryName: LIBRARY_NAME,
		scriptEngineSettings: normalizeSSREngineSettings(SSR_ENGINE_SETTINGS, SSR_DEFAULT_CACHE_SIZE),
		scriptsHome: `/${R4X_TARGETSUBDIR}`,
		ssrMaxThreads: normalizeSSRMaxThreads(SSR_MAX_THREADS),
		statsComponentsFilename: COMPONENT_STATS_FILENAME,
		userAddedNashornpolyfillsFilename: NASHORNPOLYFILLS_FILENAME ? `${NASHORNPOLYFILLS_FILENAME}.js` : null
	});
} // warmUpSync
