import {readComponentStats} from '/lib/enonic/react4xp/asset/readComponentStats';
import {IS_DEV_MODE} from '/lib/enonic/xp/runMode';


let COMPONENT_STATS = readComponentStats();


export function getComponentStats() {
	if (IS_DEV_MODE) {
		COMPONENT_STATS = readComponentStats();
	}
	return COMPONENT_STATS;
}
