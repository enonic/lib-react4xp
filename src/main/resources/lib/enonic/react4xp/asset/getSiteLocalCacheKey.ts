//@ts-ignore
import {getSite} from '/lib/xp/portal';


const NO_SITE = "#NO_SITE_CONTEXT#";


export function getSiteLocalCacheKey(rawKey :string) {
    const siteKey = (getSite() || {})._id || NO_SITE;
    return `${siteKey}_*_${rawKey}`;
}
