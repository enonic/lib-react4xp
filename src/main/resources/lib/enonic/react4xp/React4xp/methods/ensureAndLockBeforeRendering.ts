//import {toStr} from '@enonic/js-utils/value/toStr';


export function ensureAndLockBeforeRendering() {
	this.ensureAndLockId();

	//log.debug('ensureAndLockBeforeRendering() this.jsxPath:%s', toStr(this.jsxPath));
	if (!this.jsxPath) {
		throw Error("Target path for JSX component, jsxPath, has not been set. Add an absolute path (or an XP component from which to derive it) in the React4XP constructor or with the setters.");
	}

	//log.debug('ensureAndLockBeforeRendering() this.react4xpId:%s', toStr(this.react4xpId));
	if (!this.react4xpId) {
		throw Error("ID for the target container element is missing.");
	}
}
