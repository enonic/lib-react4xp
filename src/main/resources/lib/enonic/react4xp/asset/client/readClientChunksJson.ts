import {
	CLIENT_CHUNKS_FILENAME,
	R4X_TARGETSUBDIR
} from '@enonic/react4xp';
import {getNamesFromChunkfile} from '/lib/enonic/react4xp/chunk/getNamesFromChunkfile';


export function readClientChunksJson() {
	return getNamesFromChunkfile(`/${R4X_TARGETSUBDIR}/${CLIENT_CHUNKS_FILENAME}`);
}
