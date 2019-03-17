// The service /dependencies has two modes:
//   - 'dependencies/urls' returns an array of dependency URLS.
//   - just 'dependencies' will return them as HTML script tags.

var { getComponentChunkUrls } = require('/lib/enonic/react4xp/dependencies');

//var cacheLib = require('/lib/cache');

const MYSELF_ROOT = `/_/service/${app.name}/react4xp-dependencies`;
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
    log.info("params (" + typeof params + "): " + JSON.stringify(params, null, 2));
    const entryNames = Object.keys(params).filter( key => params[key] != null && ((params[key] || "") + "").trim() === "");
    relativePath.split("&").forEach(entryName => {
        if (entryName.trim() !== "" && entryNames.indexOf(entryName) === -1) {
            entryNames.push(entryName);
        }
    });

    try {
        return {
            body: getComponentChunkUrls(entryNames),
            contentType: 'application/json'
        };

    } catch (e) {
        log.warning(e.message);
        return {
            status: 404,
            body: e.message,
            contentType: 'text/plain'
        }
    }

    // NEEDS TO HAPPEN: Add this capability to the client: https://www.oreilly.com/library/view/high-performance-javascript/9781449382308/ch01.html#dynamic_script_elements
};
