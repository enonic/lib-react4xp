/** Appends a unique target container ID postfix after the currently set reactXpId (if any).
 * @returns The react4xp component itself, for builder-like pattern.
 */
export function uniqueId() {
	// Magic numbers: enforces a random 8-character base-36 string, in the range "10000000" - "zzzzzzzz" (78364164096 - 2821109907455)
	return this.setId((this.react4xpId || "r4x") + "-" + (78364164096 + Math.floor(Math.random() * 2742745743360)).toString(36));
}
