package com.enonic.lib.react4xp.ssr;

/**
 * Created on 10/05/2021 as part of
 */
public class Config {
    public final String APP_NAME;
    public final String SCRIPTS_HOME;
    public final String LIBRARY_NAME;
    public final String chunkfilesHome;
    public final String entriesJsonFilename;
    public final String chunksExternalsJsonFilename;
    public final String statsComponentsFilename;
    public final String userAddedNashornpolyfillsFilename;
    public final boolean lazyload;

    public Config(
            String APP_NAME,
            String SCRIPTS_HOME,
            String LIBRARY_NAME,
            String chunkfilesHome,
            String entriesJsonFilename,
            String chunksExternalsJsonFilename,
            String statsComponentsFilename,
            String userAddedNashornpolyfillsFilename,
            boolean lazyload) {
        this.APP_NAME = APP_NAME;
        this.SCRIPTS_HOME = SCRIPTS_HOME;                             // "/react4xp"
        this.LIBRARY_NAME = LIBRARY_NAME;                             // "React4xp"
        this.chunkfilesHome = chunkfilesHome;
        this.entriesJsonFilename = entriesJsonFilename;
        this.chunksExternalsJsonFilename = chunksExternalsJsonFilename;
        this.statsComponentsFilename = statsComponentsFilename;
        this.userAddedNashornpolyfillsFilename = userAddedNashornpolyfillsFilename;
        this.lazyload = lazyload;
    }
}
