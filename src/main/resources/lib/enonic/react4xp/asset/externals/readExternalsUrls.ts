import {
	EXTERNALS_CHUNKS_FILENAME,
	R4X_TARGETSUBDIR
} from '@enonic/react4xp';
import {getNamesFromChunkfile} from '/lib/enonic/react4xp/chunk/getNamesFromChunkfile';
import {getAssetRoot} from '/lib/enonic/react4xp/dependencies/getAssetRoot';


const FULL_EXTERNALS_CHUNKS_FILENAME = `/${R4X_TARGETSUBDIR}/${EXTERNALS_CHUNKS_FILENAME}`;


/** Returns the asset-via-service URL for the externals chunk */
export function readExternalsUrls() {
    // This should not break if there are no added externals. Externals should be optional.
    try {
        return getNamesFromChunkfile(FULL_EXTERNALS_CHUNKS_FILENAME).map(
            name => getAssetRoot() + name
        );
    } catch (e) {
        log.warning(e);
        log.warning(
            `No optional externals were found (chunkfile reference: ${FULL_EXTERNALS_CHUNKS_FILENAME}). That might be okay, or a problem.`
        );
        return [];
    }
}
