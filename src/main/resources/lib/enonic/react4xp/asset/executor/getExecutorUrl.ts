import {toStr} from '@enonic/js-utils/value/toStr';
import {getAssetRoot} from '/lib/enonic/react4xp/dependencies/getAssetRoot';
import {IS_PROD_MODE} from '/lib/enonic/xp/runMode';
import {getExecutorChunkFilename} from '/lib/enonic/react4xp/asset/executor/getExecutorChunkFilename'


let CACHED_EXECUTOR_URL :string;


export function getExecutorUrl() {
	if (IS_PROD_MODE && CACHED_EXECUTOR_URL) {
		return CACHED_EXECUTOR_URL;
	}

	CACHED_EXECUTOR_URL = `${getAssetRoot()}${getExecutorChunkFilename()}`;
	log.debug('getExecutorUrl() CACHED_EXECUTOR_URL:%s', toStr(CACHED_EXECUTOR_URL));
	return CACHED_EXECUTOR_URL;
}
