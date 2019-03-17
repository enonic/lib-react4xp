var ioLib = require('/lib/xp/io');
var { getResourceAsString, hash } = require('/lib/enonic/react4xp/clientCacheResources');
var { getNamesFromChunkfile } = require('/lib/enonic/react4xp/dependencies');


let RESPONSE = null;

exports.get = (req) => {
    if (!RESPONSE) {
        log.info("Init service react4xp-externals");

        // react4xp_constants.json is not part of lib-react4xp-runtime,
        // it's an external shared-constants file expected to exist in the build directory of this index.es6.
        // Easiest: the NPM package react4xp-buildconstants creates this file and copies it here.
        const {
            R4X_TARGETSUBDIR, EXTERNALS_CHUNKS_FILENAME
        } = require('/lib/enonic/react4xp/react4xp_constants.json');

        try {
            const externalsNames = getNamesFromChunkfile(`/${R4X_TARGETSUBDIR}/${EXTERNALS_CHUNKS_FILENAME}`);

            let fileContents = [];
            let ETags = [];

            externalsNames.forEach( name => {
                const resource = ioLib.getResource(`/${R4X_TARGETSUBDIR}/${name}`);
                if (!resource || !resource.exists()) {
                    throw Error(`File not found: /${R4X_TARGETSUBDIR}/${name}`);
                }

                const fileContent = getResourceAsString(resource);
                fileContents.push(fileContent);
                ETags.push(hash(fileContent));
            });

            RESPONSE = {
                body: fileContents.join("\n///////\n"),
                headers: {
                    'Content-Type': 'application/javascript;charset=utf-8',
                    'Cache-Control': 'no-cache',
                    ETag: ETags.join(""),
                }
            };

        } catch(e) {
            log.error(e);
            return {
                contentType: 'text/plain',
                status: 500,
                body: `Failed to resolve the Externals code (/${R4X_TARGETSUBDIR}/${EXTERNALS_CHUNKS_FILENAME}). See log for details.`
            }
        }
    }
    return RESPONSE;
};
