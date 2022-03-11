//import {toStr} from '@enonic/js-utils/value/toStr';


// For now, it seems like a good idea to ensure two things when starting the client side rendering:
// 1, there is a target ID set.
// 2, it can't be changed once the rendering has started, i.e. between render body and render pagecontributions
export function ensureAndLockId() {
	//log.debug('ensureAndLockId() this.react4xpId:%s', toStr(this.react4xpId));
	if (!this.react4xpId) {
		this.uniqueId();
	}
	//log.debug('ensureAndLockId() this.react4xpIdIsLocked:%s', toStr(this.react4xpIdIsLocked));
	this.react4xpIdIsLocked = true;
	if (this.react4xpId && this.props) {
		this.props.react4xpId = this.react4xpId;
	}
	//log.debug('ensureAndLockId() this.props:%s', toStr(this.props));
}
