// The service /dependencies has two modes:
//   - 'dependencies/urls' returns an array of dependency URLS.
//   - just 'dependencies' will return them as HTML script tags.

var { getPageContributions, STATIC_CLIENT_URL } = require('/lib/enonic/react4xp/pageContributions');

let DEPENDENCY_URLS = null;
let DEPENDENCY_TAGS = null;
let DEPENDENCY_HTML = null;

exports.get = (req) => {
    if (!DEPENDENCY_TAGS) {
        log.info("Init service dependencies: DEPENDENCY_HTML");

        const pageContributions = getPageContributions();
        DEPENDENCY_TAGS = [
            ...(pageContributions.headBegin || []),
            ...(pageContributions.headEnd || []),
            ...(pageContributions.bodyBegin || []),
            ...(pageContributions.bodyEnd || [])

        // This service is intended to be used by an exposed client method, and the client already has a statically available URL. Remove the client URL item(s).
        ].filter( scriptLine => scriptLine.indexOf(STATIC_CLIENT_URL) === -1);

        DEPENDENCY_HTML = DEPENDENCY_TAGS.join("\n");
        log.info("DEPENDENCY_HTML (" + typeof DEPENDENCY_HTML + "): " + JSON.stringify(DEPENDENCY_HTML));
    }

    if ((req.path || "").endsWith("urls")) {
        if (!DEPENDENCY_URLS) {
            log.info("Init service dependencies: DEPENDENCY_URLS");
            DEPENDENCY_URLS = DEPENDENCY_TAGS.map( scriptLine => scriptLine

                // Remove HTML and leave only the URL after 'src='  behind
                    .replace(/\s*<\s*script\s+src\s*=\s*["']/g, '')
                    .replace(/["']\s*>\s*<\/script\s*>\s*/g, '')
            );

            log.info("DEPENDENCY_URLS (" + typeof DEPENDENCY_URLS + "): " + JSON.stringify(DEPENDENCY_URLS));
        }

        return {
            body: DEPENDENCY_URLS,
            contentType: 'application/json'
        };

    } else {
        return {
            body: DEPENDENCY_HTML
        };
    }
};
