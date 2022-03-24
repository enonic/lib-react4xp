export function checkIdLock() {
	if (this.react4xpIdIsLocked) {
		throw new Error("This component has already been used to generate a body or pageContributions.es6. " +
			"Container ID can't be changed now.");
	}
}
