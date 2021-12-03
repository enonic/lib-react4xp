
const {getSite} = require('/lib/xp/portal');
const portal = require('/lib/xp/portal');

const ROOT_URLS = {};

const initServiceUrlRoot = (serviceName) => {
    const siteId = getSite()._id;
    const serviceKey = serviceName || '_SERVICEROOT_';

    if (ROOT_URLS[siteId] === undefined) {
        ROOT_URLS[siteId] = {};
    }
    const existingUrl = ROOT_URLS[siteId][serviceKey];
    if (existingUrl !== undefined) {
        return existingUrl;
    }

    const siteUrl = portal.pageUrl({id: siteId});
    const altUrl = (`${siteUrl}/_/service/${app.name}/${serviceName}/`).replace(/\/+/, '/');

    ROOT_URLS[siteId][serviceKey] = altUrl;
    return altUrl;
};

const getAssetRoot = () => {
    return initServiceUrlRoot('react4xp');
};

const getClientRoot = () => {
    return initServiceUrlRoot( 'react4xp-client');
};


const getDependenciesRoot = () => {
    return initServiceUrlRoot( 'react4xp-dependencies');
};


const getServiceRoot = () => {
    return initServiceUrlRoot( '');
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
let LOGGEDWARNING = false;
const getSuffix = (path, serviceName) => {
    const standardRoot = initServiceUrlRoot(serviceName).replace(/\/$/, '');

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
