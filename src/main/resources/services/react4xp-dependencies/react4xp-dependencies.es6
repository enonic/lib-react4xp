// The service /dependencies has two modes:
//   - 'dependencies/urls' returns an array of dependency URLS.
//   - just 'dependencies' will return them as HTML script tags.

const { insertAppName } = require('/lib/enonic/react4xp/utils');
var { getComponentChunkUrls } = require('/lib/enonic/react4xp/dependencies');

const { SERVICE_ROOT_URL } = require('/lib/enonic/react4xp/react4xp_constants.json');

const MYSELF_ROOT = `${insertAppName(SERVICE_ROOT_URL)}react4xp-dependencies/`;
const MYSELF_ROOTLENGTH = MYSELF_ROOT.length;

exports.get = (req) => {
    const path = (req.path || "").trim();

    let relativePath = path.substring(MYSELF_ROOTLENGTH);
    while (relativePath.startsWith('/')) {
        relativePath = relativePath.substring(1);
    }

    // Gets parameter entryNames. Legal syntaxes: both
    //   .../react4xp-dependencies/entry1&entry2&entry3
    // ...and...
    //   .../react4xp-dependencies?entry1&entry2&entry3
    // Parameters that have values will not be interpreted as an entry name request.
    const params = req.params || {};
    //log.info("params (" + typeof params + "): " + JSON.stringify(params, null, 2));
    const entryNames = Object.keys(params).filter( key => params[key] != null && ((params[key] || "") + "").trim() === "");
    relativePath.split("&").forEach(entryName => {
        if (entryName.trim() !== "" && entryNames.indexOf(entryName) === -1) {
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
        log.warning(e.message);
        return {
            status: 404,
            body: e.message,
            contentType: 'text/plain'
        }
    }
};
