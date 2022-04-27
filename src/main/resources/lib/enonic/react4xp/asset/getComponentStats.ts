import {readComponentStats} from '/lib/enonic/react4xp/asset/readComponentStats';
import {IS_DEV_MODE} from '/lib/enonic/xp/runMode';
//import {toStr} from 'JS_UTILS_ALIAS/value/toStr';


let COMPONENT_STATS = readComponentStats();


export function getComponentStats() {
	if (IS_DEV_MODE) {
		COMPONENT_STATS = readComponentStats();
	}
	//log.debug('getComponentStats() COMPONENT_STATS:%s', toStr(COMPONENT_STATS));
	return COMPONENT_STATS;
}
