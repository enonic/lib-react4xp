//import {toStr} from 'JS_UTILS_ALIAS/value/toStr';
import type {React4xp} from '../../React4xp';


export function ensureAndLockBeforeRendering(this: React4xp) {
	this.ensureAndLockId();

	//log.debug('ensureAndLockBeforeRendering() this.jsxPath:%s', toStr(this.jsxPath));
	if (!this.jsxPath) {
		throw new Error("Target path for JSX component, jsxPath, has not been set. Add an absolute path (or an XP component from which to derive it) in the React4XP constructor or with the setters.");
	}

	//log.debug('ensureAndLockBeforeRendering() this.react4xpId:%s', toStr(this.react4xpId));
	if (!this.react4xpId) {
		throw new Error("ID for the target container element is missing.");
	}
}
