import type {React4xp as React4xpNamespace} from '../../../../../index.d';


//import {toStr} from '@enonic/js-utils/value/toStr';


/** Sets the react4xpId - the HTML ID of the target container this component will be rendered into.
 * Deletes the ID if argument is omitted.
 * @returns The react4xp component itself, for builder-like pattern.
 */
export function setId(react4xpId :React4xpNamespace.Id) {
	//log.debug('setId() react4xpId:%s', toStr(react4xpId));
	this.checkIdLock();
	this.react4xpId = react4xpId;

	//log.debug('setId() before this.props:%s', toStr(this.props));
	if (this.props) {
		this.props.react4xpId = react4xpId;
	}
	//log.debug('setId() after this.props:%s', toStr(this.props));
	return this;
}
