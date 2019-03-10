// The service /dependencies has two modes:
//   - 'dependencies/urls' returns an array of dependency URLS.
//   - just 'dependencies' will return them as HTML script tags.

var { PAGE_CONTRIBUTIONS_ASLIST, PAGE_CONTRIBUTIONS_HTML } = require('/lib/enonic/react4xp/pageContributions');

let DEPENDENCY_URLS = null;

exports.get = (req) => {
    if ((req.path || "").endsWith("urls")) {
        if (!DEPENDENCY_URLS) {
            log.info("Init service dependencies: DEPENDENCY_URLS");
            DEPENDENCY_URLS = PAGE_CONTRIBUTIONS_ASLIST.map( scriptLine => scriptLine

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
            body: PAGE_CONTRIBUTIONS_HTML
        };
    }
};
