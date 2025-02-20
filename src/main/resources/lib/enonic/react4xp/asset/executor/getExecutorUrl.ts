import type {UrlType} from '/lib/enonic/react4xp/types/React4xp';


//import {toStr} from '@enonic/js-utils/value/toStr';
import {getAssetRoot} from '/lib/enonic/react4xp/dependencies/getAssetRoot';
import {getExecutorChunkFilename} from '/lib/enonic/react4xp/asset/executor/getExecutorChunkFilename'


// WARNING: Do not cache anything that contains assetRoot, it changes per context!
export function getExecutorUrl({
	urlType // default is app.config['react4xp.urlType'] || 'server'
}: {
	urlType?: UrlType
} = {}) {
	return `${getAssetRoot({ urlType })}${getExecutorChunkFilename()}`;
}
