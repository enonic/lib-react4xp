import type {Id} from '/lib/enonic/react4xp/types/React4xp';
import type {React4xp} from '../../React4xp';

//import {toStr} from '@enonic/js-utils/value/toStr';


/** Sets the react4xpId - the HTML ID of the target container this component will be rendered into.
 * Deletes the ID if argument is omitted.
 * @returns The react4xp component itself, for builder-like pattern.
 */
export function setId(this: React4xp, id: Id) {
	// log.debug('setId() react4xpId:%s', toStr(react4xpId));
	this.checkIdLock();
	this.react4xpId = id;
	return this;
}
