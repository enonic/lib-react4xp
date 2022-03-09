import {
	getSite,
	pageUrl,
	serviceUrl
	//@ts-ignore
} from '/lib/xp/portal';


const NO_SITE = "#\\NO_SITE_CONTEXT/#";
const ROOT_URLS = {};


function initServiceUrlRoot(serviceName :string) {
    const siteId = (getSite() || {})._id;
    const serviceKey = serviceName || '_SERVICEROOT_';

    const siteIdKey = siteId || NO_SITE;
    if (ROOT_URLS[siteIdKey] === undefined) {
        ROOT_URLS[siteIdKey] = {};
    }
    const existingUrl :string = ROOT_URLS[siteIdKey][serviceKey];
    if (existingUrl !== undefined) {
        return existingUrl;
    }

    let url :string;
    if (siteId) {
        const siteUrl = pageUrl({id: siteId});
        url = (`${siteUrl}/_/service/${app.name}/${serviceName}/`).replace(/\/+/, '/');
    } else {
        url = serviceUrl({service: serviceName}) + '/';
    }

    ROOT_URLS[siteIdKey][serviceKey] = url;
    return url;
}


export function getAssetRoot() {
    return initServiceUrlRoot('react4xp');
};


export function getClientRoot() {
    return initServiceUrlRoot('react4xp-client');
};


export function getDependenciesRoot() {
    return initServiceUrlRoot('react4xp-dependencies');
};


export function getServiceRoot() {
    return initServiceUrlRoot('');
};


const slashesAtBeginning = /^\/+/;
const slashesAtEnd = /\/+$/;
function stripSlashes(suffix :string) {
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
export function getSuffix(
	path :string,
	serviceName :string
) {
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
