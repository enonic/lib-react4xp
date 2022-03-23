import {
	EXTERNALS_CHUNKS_FILENAME,
	R4X_TARGETSUBDIR
} from '@enonic/react4xp';
import {getNamesFromChunkfile} from '/lib/enonic/react4xp/chunk/getNamesFromChunkfile';


const FULL_EXTERNALS_CHUNKS_FILENAME = `/${R4X_TARGETSUBDIR}/${EXTERNALS_CHUNKS_FILENAME}`;


export function getExternals() {
	try {
		return getNamesFromChunkfile(FULL_EXTERNALS_CHUNKS_FILENAME)
	} catch (e) {
		log.warning(e);
        log.warning(
            `No optional externals were found (chunkfile reference: ${FULL_EXTERNALS_CHUNKS_FILENAME}). That might be okay, or a problem.`
        );
		return [];
	}
}
