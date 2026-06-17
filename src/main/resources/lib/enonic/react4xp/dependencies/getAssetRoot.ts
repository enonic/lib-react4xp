import type {UrlType} from '/lib/enonic/react4xp/types/React4xp';


import {apiUrl} from '/lib/xp/portal';
import {getUrlType} from '/lib/enonic/react4xp/React4xp/utils/getUrlType';


export function getAssetRoot({
	urlType = getUrlType() // default is app.config['react4xp.urlType'] || 'server'
}: {
	urlType?: UrlType
} = {}) {
	// log.debug('getAssetRoot({ type: %s })', urlType);
	return `${apiUrl({api: 'react4xp', type: urlType})}/`;
};
