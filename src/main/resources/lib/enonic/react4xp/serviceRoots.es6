const portal = require('/lib/xp/portal');

const ROOT_URLS = {};

const initServiceUrlRoot = (siteId, serviceName, key) => {
    if (siteId === undefined) {
        throw Error('siteId is undefined, cant getAssetRoot');
    }
    let rootUrlsForSite = ROOT_URLS[siteId];
    if (rootUrlsForSite === undefined) {
        ROOT_URLS[siteId] = {};
        rootUrlsForSite = ROOT_URLS[siteId];
    }
    const existingUrl = rootUrlsForSite[key];
    if (existingUrl !== undefined) {
        return existingUrl;
    }
    const siteUrl = portal.pageUrl({id: siteId})
    //const url = portal.serviceUrl({service: serviceName, type:'server'}) + '/';
    const altUrl = (`${siteUrl}/_/service/${app.name}/${serviceName}/`).replace(/\/+/, '/');
    ROOT_URLS[siteId][key] = altUrl;
    return altUrl;
};

const getAssetRoot = (siteId) => {
    return initServiceUrlRoot(siteId,'react4xp', 'ASSET_ROOT_URL');
};

const getClientRoot = (siteId) => {
    return initServiceUrlRoot(siteId, 'react4xp-client', 'CLIENT_ROOT_URL');
};


const getDependenciesRoot = (siteId) => {
    return initServiceUrlRoot(siteId, 'react4xp-dependencies', 'DEPENDENCIES_ROOT_URL');
};


const getServiceRoot = (siteId) => {
    return initServiceUrlRoot(siteId, '', 'SERVICE_ROOT_URL');
};

const slashesAtBeginning = /^\/+/;
const slashesAtEnd = /\/+$/;
const stripSlashes = suffix => {
    return suffix.replace(slashesAtBeginning, '').replace(slashesAtEnd, '');
};

// Strips away the beginning of a service URL - the root path of the service - and returns everything after that,
// to pick up path variations not picked up in req.params, e.g. asset names after a slash.
//
// Why? For now (6.15.x), lib-router doesn't work properly in service controllers. And since portal.serviceUrl is not
// entirely consistent across calling contexts, the incoming core service path may not necessarily match the above
// constants. Hence, the workaround.
//
// Returns empty string if there is no suffix. Strips slashes from both ends.
// Throws an error if the path doesn't match any known variation of the service path.
// Logs a warning when the fallback is used.
const SERVICE_ROOTS = {};
let LOGGEDWARNING = false;
const getSuffix = (path, serviceName) => {
    const standardRoot = SERVICE_ROOTS[serviceName] = (
        SERVICE_ROOTS[serviceName] ||
        (portal.serviceUrl({service: serviceName}))
    );

    let location = path.indexOf(standardRoot);
    if (location !== -1) {
        return stripSlashes(path.substring(location + standardRoot.length));
    }

    const fallbackRoot = `/_/service/${app.name}/${serviceName}`;
    location = path.indexOf(fallbackRoot);
    if (location !== -1) {
        if (!LOGGEDWARNING) {
            log.warning(`Fallback: matched path '${path}' with service name '${serviceName}', returning suffix after service name. This will not be logged again.`);
            LOGGEDWARNING = true;
        }
        return stripSlashes(path.substring(location + fallbackRoot.length));
    }

    throw Error(`Unexpected service suffix lookup: requested path ('${path}') doesn't seem to belong to the service '${serviceName}'.`);
};

module.exports = {
    getAssetRoot, getClientRoot, getDependenciesRoot, getServiceRoot, getSuffix
};
