import type {Stats} from '../../../..'


import {
	COMPONENT_STATS_FILENAME,
	R4X_TARGETSUBDIR
} from '@enonic/react4xp/constants.runtime';
import {readResourceAsJson} from '/lib/enonic/react4xp/resource/readResourceAsJson';


export function readComponentStats() {
	return readResourceAsJson(`/${R4X_TARGETSUBDIR}/${COMPONENT_STATS_FILENAME}`) as Stats;
}
