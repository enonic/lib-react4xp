import {
	EXTERNALS_CHUNKS_FILENAME,
	R4X_TARGETSUBDIR  // assets/react4xp
	//@ts-ignore
} from '/lib/enonic/react4xp/react4xp_constants.json';
import {getNamesFromChunkfile} from '/lib/enonic/react4xp/dependencies';


export function getExternals() {
	return getNamesFromChunkfile(`/${R4X_TARGETSUBDIR}/${EXTERNALS_CHUNKS_FILENAME}`)
}
