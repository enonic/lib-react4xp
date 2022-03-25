import {R4X_TARGETSUBDIR} from '@enonic/react4xp';

import {getResource} from '/lib/enonic/react4xp/resource/getResource';
import {readResourceAsJson} from '/lib/enonic/react4xp/resource/readResourceAsJson';


/** Open a chunkfile, read the contents and return the domain-relative urls for non-entry JS file references in the chunk file.
 * Throws an error if not found or if unexpected format. */
export function getNamesFromChunkfile(chunkFile :string) {

    const chunks = readResourceAsJson(chunkFile) as {
		[key :PropertyKey] :{
			js :string|Array<string>
		}
	};

    return Object.keys(chunks).map(chunkName => {
        let chunk = chunks[chunkName].js;

        while (Array.isArray(chunk)) {
            if (chunk.length > 1) {
                throw new Error(
                    `Unexpected value in ${chunkFile}: [${chunkName}].js is an array with more than 1 array: ${JSON.stringify(
                        chunk,
                        null,
                        2
                    )}`
                );
            }
            chunk = chunk[0];
        }

        if (chunk.startsWith("/")) {
            chunk = chunk.substring(1);
        }

        // Fail fast: verify that it exists and has a content
        const resource = getResource(`/${R4X_TARGETSUBDIR}/${chunk}`);
        if (!resource || !resource.exists()) {
            throw new Error(
                `React4xp dependency chunk not found: /${R4X_TARGETSUBDIR}/${chunk}`
            );
        }

        return chunk;
    });
}
