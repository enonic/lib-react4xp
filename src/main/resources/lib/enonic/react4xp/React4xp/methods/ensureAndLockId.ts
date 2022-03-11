// For now, it seems like a good idea to ensure two things when starting the client side rendering:
// 1, there is a target ID set.
// 2, it can't be changed once the rendering has started, i.e. between render body and render pagecontributions
export function ensureAndLockId() {
	if (!this.react4xpId) {
		this.uniqueId();
	}
	this.react4xpIdIsLocked = true;
	if (this.react4xpId && this.props) {
		this.props.react4xpId = this.react4xpId;
	}
}
