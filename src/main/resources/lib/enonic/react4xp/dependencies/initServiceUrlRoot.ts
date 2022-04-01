import {
	getSite,
	pageUrl,
	serviceUrl
	//@ts-ignore
} from '/lib/xp/portal';


const NO_SITE = "#\\NO_SITE_CONTEXT/#";
const ROOT_URLS = {};


export function initServiceUrlRoot(serviceName :string) {
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
