// The service /dependencies has two modes:
//   - 'dependencies/urls' returns an array of dependency URLS.
//   - just 'dependencies' will return them as HTML script tags.

var { getPageContributions } = require('/lib/enonic/react4xp/pageContributions');


let DEPENDENCY_URLS = null;
let DEPENDENCY_TAGS = null;
let DEPENDENCY_HTML = null;

exports.get = (req) => {
    if (!DEPENDENCY_TAGS) {
        const pageContributions = getPageContributions();
        log.info("pageContributions (" + typeof pageContributions + "): " + JSON.stringify(pageContributions, null, 2));
        DEPENDENCY_TAGS = [
            ...(pageContributions.headBegin || []),
            ...(pageContributions.headEnd || []),
            ...(pageContributions.bodyBegin || []),
            ...(pageContributions.bodyEnd || [])

        ];
        log.info("DEPENDENCY_TAGS (" + typeof DEPENDENCY_TAGS + "): " + JSON.stringify(DEPENDENCY_TAGS, null, 2));

        DEPENDENCY_HTML = DEPENDENCY_TAGS.join("\n");
        log.info("DEPENDENCY_HTML (" + typeof DEPENDENCY_HTML + "): " + JSON.stringify(DEPENDENCY_HTML, null, 2));
    }

    if ((req.path || "").endsWith("urls")) {
        if (!DEPENDENCY_URLS) {
            log.info("Init service dependencies: DEPENDENCY_URLS");
            DEPENDENCY_URLS = DEPENDENCY_TAGS.map( scriptLine => scriptLine

                // Remove HTML and leave only the URL after 'src='  behind
                    .replace(/\s*<\s*script\s+src\s*=\s*["']/g, '')
                    .replace(/["']\s*>\s*<\/script\s*>\s*/g, '')
            );

            log.info("Pure dependencies: " + JSON.stringify(DEPENDENCY_URLS));
        }

        return {body: JSON.stringify(DEPENDENCY_URLS) };

    } else {
        return {
            body: DEPENDENCY_HTML
        };
    }

};
