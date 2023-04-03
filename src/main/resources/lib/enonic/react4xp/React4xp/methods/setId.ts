import type { Id } from '/types';
import type {React4xp} from '../../React4xp';
//import {toStr} from '@enonic/js-utils/value/toStr';


/** Sets the react4xpId - the HTML ID of the target container this component will be rendered into.
 * Deletes the ID if argument is omitted.
 * @returns The react4xp component itself, for builder-like pattern.
 */
export function setId(this: React4xp, react4xpId: Id) {
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
