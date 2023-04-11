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
    public final String CHUNKSGLOBALS_JSON_FILENAME;
    public final String STATS_COMPONENTS_FILENAME;

    public Config(
            String appName,
            String scriptsHome,
            String libraryName,
            String chunkfilesHome,
            String entriesJsonFilename,
            String chunksGlobalsJsonFilename,
            String statsComponentsFilename) {
        this.APP_NAME = appName;
        this.SCRIPTS_HOME = scriptsHome;                                 // Usually: "/react4xp"
        this.LIBRARY_NAME = libraryName;                                 // "React4xp"
        this.CHUNKFILES_HOME = chunkfilesHome;                           // "/react4xp/"
        this.ENTRIES_JSON_FILENAME = entriesJsonFilename;
        this.CHUNKSGLOBALS_JSON_FILENAME = chunksGlobalsJsonFilename;
        this.STATS_COMPONENTS_FILENAME = statsComponentsFilename;
    }
}
