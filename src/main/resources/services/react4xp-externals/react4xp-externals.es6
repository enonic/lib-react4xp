var ioLib = require('/lib/xp/io');
var { getResourceAsString } = require('/lib/enonic/react4xp/clientCacheResources');
var { getNamesFromChunkfile } = require('/lib/enonic/react4xp/dependencies');


let RESPONSE = null;

exports.get = (req) => {
    if (!RESPONSE) {
        // react4xp_constants.json is not part of lib-react4xp-runtime,
        // it's an external shared-constants file expected to exist in the build directory of this index.es6.
        // Easiest: the NPM package react4xp-buildconstants creates this file and copies it here.
        const {
            R4X_TARGETSUBDIR, EXTERNALS_CHUNKS_FILENAME
        } = require('/lib/enonic/react4xp/react4xp_constants.json');
        // TODO: The above (require) doesn't sem to handle re-reading updated files in XP dev runmode. Is that necessary? If so, use dependencies.readResourceAsJson instead!

        try {
            const externalsNames = getNamesFromChunkfile(`/${R4X_TARGETSUBDIR}/${EXTERNALS_CHUNKS_FILENAME}`);

            let fileContents = [];

            externalsNames.forEach( name => {
                const resource = ioLib.getResource(`/${R4X_TARGETSUBDIR}/${name}`);
                if (!resource || !resource.exists()) {
                    throw Error(`File not found: /${R4X_TARGETSUBDIR}/${name}`);
                }

                fileContents.push(getResourceAsString(resource));
            });

            const fileContent = fileContents.join("\n///////\n");

            RESPONSE = {
                body: fileContent,
                /*headers: {
                    'Content-Type': 'application/javascript;charset=utf-8',
                    'Cache-Control': 'no-cache',
                    ETag: hash(fileContent),        // FIXME: ETAG not working, using standard client cache instead, limited to 1 hour since it's not hashed
                }*/
                headers: {
                    'Content-Type': 'application/javascript;charset=utf-8',
                    'Cache-Control': 'public, max-age=3600'
                }
            };

        } catch(e) {
            const warning = `No optional externals was found (timestamp: ${new Date()})`;
            log.warning(e);
            log.warning(`React4xp-externals service: ${warning} Chunkfile reference: ${R4X_TARGETSUBDIR}/${EXTERNALS_CHUNKS_FILENAME}`);

            RESPONSE = {
                body: `// ${warning} See the server log for details.`,
                headers: {
                    'Content-Type': 'application/javascript;charset=utf-8',
                }
            }
        }
    }
    return RESPONSE;
};
