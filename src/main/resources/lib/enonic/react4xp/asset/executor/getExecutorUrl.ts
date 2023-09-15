//import {toStr} from '@enonic/js-utils/value/toStr';
import { getAssetRoot } from '/lib/enonic/react4xp/dependencies/getAssetRoot';
import { getExecutorChunkFilename } from '/lib/enonic/react4xp/asset/executor/getExecutorChunkFilename'


// WARNING: Do not cache anything that contains assetRoot, it changes per context!
export function getExecutorUrl({
	type = 'server'
}: {
	type?: 'server' | 'absolute'
} = {}) {
	return `${getAssetRoot({ type })}${getExecutorChunkFilename()}`;
}
