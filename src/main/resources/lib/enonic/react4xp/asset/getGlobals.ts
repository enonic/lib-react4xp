import {
	GLOBALS_FILENAME,
	R4X_TARGETSUBDIR
} from '@enonic/react4xp/constants.runtime';
import {getNamesFromChunkfile} from '/lib/enonic/react4xp/chunk/getNamesFromChunkfile';


const FULL_GLOBALS_CHUNKS_FILENAME = `/${R4X_TARGETSUBDIR}/${GLOBALS_FILENAME}`;


export function getGlobals() {
	try {
		return getNamesFromChunkfile(FULL_GLOBALS_CHUNKS_FILENAME)
	} catch (e) {
		log.warning(e);
		log.warning(
			`No optional globals were found (chunkfile reference: ${FULL_GLOBALS_CHUNKS_FILENAME}). That might be okay, or a problem.`
		);
		return [];
	}
}
