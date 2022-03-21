import type {Stats} from '../../../..'


import {COMPONENT_STATS_FILENAME} from '@enonic/react4xp';
import {
	R4X_TARGETSUBDIR  // assets/react4xp
	//@ts-ignore
} from '/lib/enonic/react4xp/react4xp_constants.json';
import {
	getResource,
	readLines
	//@ts-ignore
} from '/lib/xp/io';


const REACT4XP_ROOT = `/${R4X_TARGETSUBDIR}/`;


export function readComponentStats() {
	return JSON.parse(
	    readLines(getResource(REACT4XP_ROOT + COMPONENT_STATS_FILENAME).getStream())
	        .join(" ")
	) as Stats;
}
