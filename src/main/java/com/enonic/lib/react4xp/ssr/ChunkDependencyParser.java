package com.enonic.lib.react4xp.ssr;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.Iterator;
import java.util.LinkedList;

/** Reads and parses file names from webpack-generated JSON files that list up contenthashed bundle chunk names. */
public class ChunkDependencyParser {
    private final static Logger LOG = LoggerFactory.getLogger( ChunkDependencyParser.class );

    private JSONObject getJSON(String fileName) throws IOException {
        String json = ResourceHandler.readResource(fileName);
        return new JSONObject(json);
    }

    private LinkedList<String> getDependencyNamesFromChunkFile(String externals) throws IOException {
                                                                                                                        LOG.info("getDependencyNamesFromChunkFile - chunkFile: " + externals);

        LinkedList<String> accumulator = new LinkedList<>();

        JSONObject fileContentData = getJSON(externals);

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
                    LOG.error("File: " + externals);
                    LOG.error("Chunk (" + chunk.getClass().getSimpleName() + "): " + chunk);
                    throw e2;
                }
            }

                                                                                                                        LOG.info("getDependencyNamesFromChunkFile + fileName: " + fileName);
            accumulator.add(fileName);
        }

        return accumulator;
    }

    private LinkedList<String> getDependencyNamesFromStatsFile(String statsFile, LinkedList<String> entries, boolean doLazyLoad) throws IOException {
        LinkedList<String> accumulator = new LinkedList<>();
        if (doLazyLoad) {
            return accumulator;
        }

                                                                                                                        LOG.info("getDependencyNamesFromStatsFile - statsFile: " + statsFile);

        JSONObject fileContentData = getJSON(statsFile);
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
                String fileName = (String)obj;
                if (!accumulator.contains(fileName) && !entries.contains(fileName) && fileName.endsWith(".js")) {
                                                                                                                        LOG.info("getDependencyNamesFromStatsFile + fileName: " + fileName);
                    accumulator.add(fileName);
                }
            }
        }

        return accumulator;
    }

    private LinkedList<String> getEntriesList(String entryFile) throws IOException {
        LinkedList<String> entries = new LinkedList<>();
        if (entryFile == null || entryFile.trim().isEmpty()) {
            return entries;
        }

        String json = ResourceHandler.readResource(entryFile);
        JSONArray fileContentData = new JSONArray(json);
        Iterator it = fileContentData.iterator();
        while (it.hasNext()) {
            entries.add((String)it.next());
        }

        return entries;
    }

    public LinkedList<String> getScriptDependencyNames(String chunkfilesHome, String entriesJsonFilename, String chunksExternalsJsonFilename, String statsComponentsFilename, boolean lazyLoad) throws IOException {
        LinkedList<String> dependencies = new LinkedList<>();

        LinkedList<String> entries = getEntriesList(chunkfilesHome + entriesJsonFilename);

        LinkedList<String> externalsDependencies = getDependencyNamesFromChunkFile(chunkfilesHome + chunksExternalsJsonFilename);
        for (String dependency : externalsDependencies) {
            if (!dependencies.contains(dependency)) {
                dependencies.add(dependency);
            }
        }

        LinkedList<String> statsDependencies = getDependencyNamesFromStatsFile(chunkfilesHome + statsComponentsFilename, entries, lazyLoad);
        for (String dependencyName : statsDependencies) {
            if (!dependencies.contains(dependencyName)) {
                dependencies.add(dependencyName);
            }
        }

        return dependencies;
    }
}
