//@ts-ignore
import {newCache} from '/lib/cache';
import {IS_PROD_MODE} from '/lib/enonic/react4xp/xp/runMode';


export const dependenciesCache = IS_PROD_MODE
    ? newCache({
        size: 300,
        expire: 10800 // 30 hours
    })
    : null;
