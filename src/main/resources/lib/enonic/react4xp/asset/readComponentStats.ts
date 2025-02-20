import type {Stats} from '/lib/enonic/react4xp/types/Stats';


import {COMPONENT_STATS_FILENAME, R4X_TARGETSUBDIR} from '@enonic/react4xp';
import {readResourceAsJson} from '/lib/enonic/react4xp/resource/readResourceAsJson';


export function readComponentStats() {
	return readResourceAsJson(`/${R4X_TARGETSUBDIR}/${COMPONENT_STATS_FILENAME}`) as Stats;
}
