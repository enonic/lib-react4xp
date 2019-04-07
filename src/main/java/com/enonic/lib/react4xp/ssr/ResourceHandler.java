package com.enonic.lib.react4xp.ssr;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

public class ResourceHandler {
    private final static Logger LOG = LoggerFactory.getLogger( ResourceHandler.class );

    /** Read as string the content of a file (resource) inside the built JAR.
     * @param path is full "file" name, relative to JAR root. */
    public static String readResource(String path) throws IOException {

        InputStream in = ResourceHandler.class.getResourceAsStream(path);
        if (in == null) {
            throw new FileNotFoundException("Not found: " + path);
        }

        BufferedReader reader = new BufferedReader(new InputStreamReader(in));
        StringBuilder sb = new StringBuilder();
        String line;

        try {
            while ((line = reader.readLine()) != null) {
                sb.append(line + "\n");
            }
        } catch (IOException e) {
            e.printStackTrace();
            throw e;

        } finally {
            try {
                reader.close();
                in.close();

            } catch (IOException e) {
                e.printStackTrace();
                throw e;
            }
        }

        return sb.toString();
    }
}
