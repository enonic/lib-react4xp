package com.enonic.lib.react4xp.ssr.resources;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.enonic.lib.react4xp.ssr.Config;

/** Reads and parses file names from webpack-generated JSON files that list up contenthashed bundle chunk names. */
public class ChunkDependencyParser {
    private final static Logger LOG = LoggerFactory.getLogger( ChunkDependencyParser.class );

    private final long id;
    private final ResourceReader resourceReader;

    public ChunkDependencyParser( ResourceReader resourceReader, long id) {
        this.id = id;
        this.resourceReader = resourceReader;
    }

    private JSONArray getJSONArray(String fileName) throws IOException {
        String json =  resourceReader.readResource(fileName);
        return new JSONArray(json);
    }

    private JSONObject getJSONObject(String fileName) throws IOException {
        String json =  resourceReader.readResource(fileName);
        return new JSONObject(json);
    }

    private List<String> getDependencyNamesFromChunkFile(String externalsChunkFile) throws IOException {
        List<String> accumulator = new ArrayList<>();

        JSONObject fileContentData = getJSONObject(externalsChunkFile);

        Iterator<String> keys = fileContentData.keys();
        while(keys.hasNext()) {
            String chunkName = keys.next();

            JSONObject chunk = (JSONObject)fileContentData.get(chunkName);

            Object fetchedChunk = null;
            String fileName;
            try {
                fetchedChunk = chunk.get("js");
                fileName = (String)fetchedChunk;
            } catch (Exception e1) {

                try {
                    JSONArray arr = (JSONArray)fetchedChunk;
                    if (arr.length() != 1) {
                        throw new JSONException("Unexpected JSON chunk format, expected exactly 1 item in array.");
                    }
                    fileName = (String) arr.get(0);

                } catch (Exception e2) {
                    LOG.error("File: " + externalsChunkFile);
                    LOG.error("Chunk (" + chunk.getClass().getSimpleName() + "): " + chunk);
                    throw e2;
                }
            }
            accumulator.add(fileName);
        }

        return accumulator;
    }

    private List<String> getDependencyNamesFromStatsFile(String statsFile, List<String> entries, boolean doLazyLoad) throws IOException {
        List<String> accumulator = new ArrayList<>();
        if (doLazyLoad) {
            return accumulator;
        }

        JSONObject fileContentData = getJSONObject(statsFile);
        Object entryObj = fileContentData.get("entrypoints");
        if (entryObj == null) {
            return accumulator;
        }

        JSONObject entrypoints = (JSONObject)entryObj;
        Iterator<String> entryKeys = entrypoints.keys();
        while(entryKeys.hasNext()) {
            String entryName = entryKeys.next();
            JSONObject entryData = (JSONObject)entrypoints.get(entryName);
            JSONArray assets = (JSONArray)entryData.get("assets");
            for (Object obj : assets) {
                String fileName = null;
                try {
                    fileName = (String)((JSONObject)obj).get("name");
                } catch (Exception e) {
                    try {
                        fileName = (String)obj;
                    } catch (Exception e2) {
                        throw new RuntimeException("Couldn't parse dependency file name from stats file - asset obj seems to be neither a JSONObject with a .name attribute, nor a string. Asset obj = " + obj.toString());
                    }
                }
                if (!accumulator.contains(fileName) && !entries.contains(fileName) && fileName.endsWith(".js")) {
                    accumulator.add(fileName);
                }
            }
        }

        return accumulator;
    }

    private List<String> getEntriesList(String entryFile) throws IOException {
        List<String> entries = new ArrayList<>();
        if (entryFile == null || entryFile.trim().isEmpty()) {
            return entries;
        }

        JSONArray fileContentData = getJSONArray(entryFile);
		for ( final Object fileContentDatum : fileContentData )
		{
			entries.add( (String) fileContentDatum );
		}

        return entries;
    }

    public List<String> getScriptDependencyNames(Config config) throws IOException {
        List<String> dependencies = new ArrayList<>();

        String externalsChunkFile = config.CHUNKFILES_HOME + config.CHUNKSEXTERNALS_JSON_FILENAME;
        List<String> externalsDependencies = getDependencyNamesFromChunkFile(externalsChunkFile);
        for (String dependency : externalsDependencies) {
            if (!dependencies.contains(dependency)) {
                dependencies.add(dependency);
            }
        }

        String entryFile = config.CHUNKFILES_HOME + config.ENTRIES_JSON_FILENAME;
        List<String> entries = getEntriesList(entryFile);

        String statsFile = config.CHUNKFILES_HOME + config.STATS_COMPONENTS_FILENAME;
        List<String> statsDependencies = getDependencyNamesFromStatsFile(statsFile, entries, config.LAZYLOAD);
        for (String dependencyName : statsDependencies) {
            if (!dependencies.contains(dependencyName)) {
                dependencies.add(dependencyName);
            }
        }
        return dependencies;
    }


    public String toString() {
        return ChunkDependencyParser.class.getSimpleName() + "#" + id;
    }
}
