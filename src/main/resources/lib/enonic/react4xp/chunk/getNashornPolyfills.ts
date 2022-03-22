import {
	NASHORNPOLYFILLS_CHUNKS_FILENAME,
	R4X_TARGETSUBDIR
} from '@enonic/react4xp';
import {getNamesFromChunkfile} from '/lib/enonic/react4xp/chunk/getNamesFromChunkfile';


export function getNashornPolyfills() {
	return getNamesFromChunkfile(`/${R4X_TARGETSUBDIR}/${NASHORNPOLYFILLS_CHUNKS_FILENAME}`);
}
