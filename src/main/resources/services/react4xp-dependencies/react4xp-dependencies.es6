// The service /dependencies has two modes:
//   - 'dependencies/urls' returns an array of dependency URLS.
//   - just 'dependencies' will return them as HTML script tags.

var { getDependencies } = require('/lib/enonic/react4xp/dependencies');
var cacheLib = require('/lib/cache');
const portalLib = require('/lib/xp/portal');

const ASSET_ROOT = portalLib.serviceUrl({service: 'react4xp'});
const MYSELF_ROOT = portalLib.serviceUrl({service: 'react4xp-dependencies'});

exports.get = (req) => {
    const path = (req.path || "").trim();
    log.info(MYSELF_ROOT);
    log.info(ASSET_ROOT);
    log.info(path);




    /*NEEDS TO HAPPEN:
        Step0: Add this capability to the client: https://www.oreilly.com/library/view/high-performance-javascript/9781449382308/ch01.html#dynamic_script_elements
        Step1: "/" should be a get-urls-from-all-dependencies service
        Step2: "/<entryName>" should return a list of urls for dependencies for that entryName. See dependency tracking with STATS, e.g. https://github.com/FormidableLabs/webpack-stats-plugin
        OR URLS?*/

    return {
        body: {OK:"OK"},
        contentType: 'application/json'
    };

};
