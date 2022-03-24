import {readClientUrls} from '/lib/enonic/react4xp/asset/client/readClientUrls';
import {readClientUrlsCached} from '/lib/enonic/react4xp/asset/client/readClientUrlsCached';
import {IS_PROD_MODE} from '/lib/enonic/xp/runMode';


export const getClientUrls = IS_PROD_MODE
    ? readClientUrlsCached
    : readClientUrls;
