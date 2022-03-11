export function ensureAndLockBeforeRendering() {
	this.ensureAndLockId();

	if (!this.jsxPath) {
		throw Error("Target path for JSX component, jsxPath, has not been set. Add an absolute path (or an XP component from which to derive it) in the React4XP constructor or with the setters.");
	}
	if (!this.react4xpId) {
		throw Error("ID for the target container element is missing.");
	}
}
