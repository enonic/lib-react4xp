import {
	GLOBALS_FILENAME,
	R4X_TARGETSUBDIR
} from '@enonic/react4xp';
import { getNamesFromChunkfile } from '/lib/enonic/react4xp/chunk/getNamesFromChunkfile';
import { getAssetRoot } from '/lib/enonic/react4xp/dependencies/getAssetRoot';


const FULL_GLOBALS_CHUNKS_FILENAME = `/${R4X_TARGETSUBDIR}/${GLOBALS_FILENAME}`;


// WARNING: Do not cache anything that contains assetRoot, it changes per context!
/** Returns the asset-via-service URL for the globals chunk */
export function getGlobalsUrls({
	urlType // default is app.config['react4xp.urlType'] || 'server'
}: {
	urlType?: 'server' | 'absolute'
} = {}) {
	// This should not break if there are no added globals. GLOBALS should be optional.
	try {
		return getNamesFromChunkfile(FULL_GLOBALS_CHUNKS_FILENAME).map(
			name => getAssetRoot({ urlType }) + name
		);
	} catch (e) {
		log.warning(e);
		log.warning(
			`No optional globals were found (chunkfile reference: ${FULL_GLOBALS_CHUNKS_FILENAME}). That might be okay, or a problem.`
		);
		return [];
	}
}
