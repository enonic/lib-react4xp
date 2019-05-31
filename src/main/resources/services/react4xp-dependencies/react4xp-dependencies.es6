// The service /dependencies has two modes:
//   - 'dependencies/urls' returns an array of dependency URLS.
//   - just 'dependencies' will return them as HTML script tags.
var { getComponentChunkUrls } = require('/lib/enonic/react4xp/dependencies');
var { getDependenciesRoot, getSuffix } = require('/lib/enonic/react4xp/serviceRoots');

const SERVICE_NAME = 'react4xp-dependencies';

exports.get = (req) => {
    let relativePath;
    try {
        relativePath = getSuffix((req.path || "").trim(), SERVICE_NAME);

    } catch (e) {
        log.warning(`STATUS 400: ${e.message}`);
        return {
            status: 400,
            body: e.message,
            contentType: 'text/plain'
        }
    }

    // Gets parameter entryNames. Legal syntaxes: both
    //   .../react4xp-dependencies/entry1&entry2&entry3
    // ...and...
    //   .../react4xp-dependencies?entry1&entry2&entry3
    // Parameters that have values will not be interpreted as an entry name request.
    const params = req.params || {};
    const entryNames = Object.keys(params).filter( key => params[key] != null && ((params[key] || "") + "").trim() === "");
    relativePath.split("&").forEach(entryName => {
        if (entryName.trim() !== "" && entryNames.indexOf(entryName) === -1) {
            //log.info("entryName (" + typeof entryName + "): " + JSON.stringify(entryName, null, 2));
            entryNames.push(entryName);
        }
    });

    try {
        return {
            body: getComponentChunkUrls(entryNames),
            contentType: 'application/json',
            // FIXME: ETAG not working, using standard client cache instead, limited to 1 hour since it's not hashed
            headers: {
                'Content-Type': 'application/javascript;charset=utf-8',
                'Cache-Control': 'public, max-age=3600'
            }
        };

    } catch (e) {
        log.warning(`STATUS 404: ${e.message}`);
        return {
            status: 404,
            body: e.message,
            contentType: 'text/plain'
        }
    }
};
