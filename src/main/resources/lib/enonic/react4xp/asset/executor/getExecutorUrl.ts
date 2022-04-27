//import {toStr} from 'JS_UTILS_ALIAS/value/toStr';
import {getAssetRoot} from '/lib/enonic/react4xp/dependencies/getAssetRoot';
import {getExecutorChunkFilename} from '/lib/enonic/react4xp/asset/executor/getExecutorChunkFilename'


// WARNING: Do not cache anything that contains assetRoot, it changes per context!
export function getExecutorUrl() {
	return `${getAssetRoot()}${getExecutorChunkFilename()}`;
}
