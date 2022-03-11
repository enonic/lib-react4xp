const { normalizeSSREngineSettings, normalizeSSRMaxThreads } = require('./normalizing');
const SSRreact4xp = __.newBean('com.enonic.lib.react4xp.ssr.ServerSideRenderer');

const SSR_DEFAULT_CACHE_SIZE = 1000;

// react4xp_constants.json is not part of lib-react4xp:
// it's an external shared-constants file expected to exist in the build directory of this index.es6.
// Easiest: use <projectRoot>/react4xp.properties and the build.gradle from https://www.npmjs.com/package/react4xp
const {
    LIBRARY_NAME,
    R4X_TARGETSUBDIR,
    NASHORNPOLYFILLS_FILENAME,
    EXTERNALS_CHUNKS_FILENAME,
    COMPONENT_STATS_FILENAME,
    ENTRIES_FILENAME,
    SSR_LAZYLOAD,                   // <-- lazyLoading main switch: true/false
    SSR_MAX_THREADS,                // <-- set to 0/undefined/null for unlimited, otherwise a number for an upper concurrency limit (to save memory)
    SSR_ENGINE_SETTINGS,            // <-- set to 0 to switch off nashorn cache, otherwise cache size (number) or full settings (comma-separated string referring to https://github.com/openjdk/nashorn/blob/main/src/org.openjdk.nashorn/share/classes/org/openjdk/nashorn/internal/runtime/resources/Options.properties )
//} = require("./react4xp_constants.json");
} = require('/lib/enonic/react4xp/react4xp_constants.json');
// TODO: The above (require) doesn't seem to handle re-reading updated files in XP dev runmode. Is that necessary? If so, use dependencies.readResourceAsJson instead!


SSRreact4xp.setup(
    app.name,
    `/${R4X_TARGETSUBDIR}`,
    LIBRARY_NAME,
    `/${R4X_TARGETSUBDIR}/`,
    NASHORNPOLYFILLS_FILENAME ? `${NASHORNPOLYFILLS_FILENAME}.js` : null,
    ENTRIES_FILENAME,
    EXTERNALS_CHUNKS_FILENAME,
    COMPONENT_STATS_FILENAME,
    !!SSR_LAZYLOAD && SSR_LAZYLOAD !== 'false',
    normalizeSSRMaxThreads(SSR_MAX_THREADS),
    normalizeSSREngineSettings(SSR_ENGINE_SETTINGS, SSR_DEFAULT_CACHE_SIZE)
);

module.exports = {
    get: () => SSRreact4xp
};
