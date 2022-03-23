import {readExternalsUrlsCached} from '/lib/enonic/react4xp/asset/externals/readExternalsUrlsCached';
import {readExternalsUrls} from '/lib/enonic/react4xp/asset/externals/readExternalsUrls';
import {IS_PROD_MODE} from '/lib/enonic/xp/runMode';


export const getExternalsUrls = IS_PROD_MODE
    ? readExternalsUrlsCached
    : readExternalsUrls;
