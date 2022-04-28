package com.enonic.lib.react4xp.ssr;

/**
 * Created on 10/05/2021 as part of
 */
public class Config {
    public final String APP_NAME;
    public final String SCRIPTS_HOME;
    public final String LIBRARY_NAME;
    public final String CHUNKFILES_HOME;
    public final String ENTRIES_JSON_FILENAME;
    public final String CHUNKSEXTERNALS_JSON_FILENAME;
    public final String STATS_COMPONENTS_FILENAME;
    public final boolean LAZYLOAD;

    public Config(
            String appName,
            String scriptsHome,
            String libraryName,
            String chunkfilesHome,
            String entriesJsonFilename,
            String chunksExternalsJsonFilename,
            String statsComponentsFilename,
            boolean lazyload) {
        this.APP_NAME = appName;
        this.SCRIPTS_HOME = scriptsHome;                                 // Usually: "/react4xp"
        this.LIBRARY_NAME = libraryName;                                 // "React4xp"
        this.CHUNKFILES_HOME = chunkfilesHome;                           // "/react4xp/"
        this.ENTRIES_JSON_FILENAME = entriesJsonFilename;
        this.CHUNKSEXTERNALS_JSON_FILENAME = chunksExternalsJsonFilename;
        this.STATS_COMPONENTS_FILENAME = statsComponentsFilename;
        this.LAZYLOAD = lazyload;
    }
}
