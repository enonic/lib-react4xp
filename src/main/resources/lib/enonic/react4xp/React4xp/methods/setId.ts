import type {React4xp as React4xpNamespace} from '../../../../../index.d';


/** Sets the react4xpId - the HTML ID of the target container this component will be rendered into.
 * Deletes the ID if argument is omitted.
 * @returns The react4xp component itself, for builder-like pattern.
 */
export function setId(react4xpId :React4xpNamespace.Id) {
	this.checkIdLock();
	this.react4xpId = react4xpId;
	if (this.props) {
		this.props.react4xpId = react4xpId;
	}
	return this;
}
