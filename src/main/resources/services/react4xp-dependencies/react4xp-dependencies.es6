// The service /dependencies has two modes:
//   - 'dependencies/urls' returns an array of dependency URLS.
//   - just 'dependencies' will return them as HTML script tags.

var { PAGE_CONTRIBUTIONS_ASLIST, PAGE_CONTRIBUTIONS_HTML } = require('/lib/enonic/react4xp/dependencies');

let DEPENDENCY_URLS = null;

exports.get = (req) => {
    /*NEEDS TO HAPPEN:
        Step0: Add this capability to the client: https://www.oreilly.com/library/view/high-performance-javascript/9781449382308/ch01.html#dynamic_script_elements
        Step1: "/" should be a get-urls-from-all-dependencies service
        Step2: "/<entryName>" should return a list of urls for dependencies for that entryName. See dependency tracking with STATS, e.g. https://github.com/FormidableLabs/webpack-stats-plugin
        OR URLS?*/

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
    }
};
