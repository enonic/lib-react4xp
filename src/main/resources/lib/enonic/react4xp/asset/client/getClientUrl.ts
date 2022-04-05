import {readClientUrl} from '/lib/enonic/react4xp/asset/client/readClientUrl';
import {readClientUrlCached} from '/lib/enonic/react4xp/asset/client/readClientUrlCached';
import {IS_PROD_MODE} from '/lib/enonic/xp/runMode';


export const getClientUrl = IS_PROD_MODE
    ? readClientUrlCached
    : readClientUrl;
