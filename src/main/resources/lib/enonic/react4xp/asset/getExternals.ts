import {
	EXTERNALS_CHUNKS_FILENAME,
	R4X_TARGETSUBDIR
} from '@enonic/react4xp';
import {getNamesFromChunkfile} from '/lib/enonic/react4xp/chunk/getNamesFromChunkfile';


export function getExternals() {
	return getNamesFromChunkfile(`/${R4X_TARGETSUBDIR}/${EXTERNALS_CHUNKS_FILENAME}`)
}
