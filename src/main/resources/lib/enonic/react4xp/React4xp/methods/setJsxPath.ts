/** When you want to use a particular JSX file (other than the default, a JSX file in the same folder as the XP component,
 * with the same name as the folder).
 *
 * @param jsxPath (string, mandatory) Name of a JSX file, will be interpreted as a full, absolute JSX path. NOTE
 *        that these are component NAME strings, not file paths that can be relative. So avoid stuff like "..", "//", "./", etc.
 *        After building the parent project with react4xp-build-components,
 *        the available entry jsxPaths can be seen in build/main/resources/react4xp/entries.json.
 *
 * @returns The React4xp object itself, for builder-like pattern.
 */
export function setJsxPath(jsxPath :string) {
	// Enforce a clean jsxPath - it's not just a file reference, but a react4xp component name!
	this.checkIdLock()
	if (
		(jsxPath || '').trim() === '' ||
		jsxPath.startsWith('.') ||
		jsxPath.startsWith('/') ||
		jsxPath.indexOf('..') !== -1 ||
		jsxPath.indexOf('/./') !== -1 ||
		jsxPath.indexOf('//') !== -1 ||
		jsxPath.indexOf('\\.\\') !== -1 ||
		jsxPath.indexOf('\\\\') !== -1 ||
		jsxPath.startsWith("\\")
	) {
		throw new Error(`React4xp.setJsxFileName: invalid jsxPath (${JSON.stringify(jsxPath)}). This is a NAME, not a relative path, so it can't be missing/empty, or contain '..', '//', '/./' or start with '.' or '/'.${this.component ? ` Component: ${JSON.stringify(this.component)}` : ''}`);
	}

	// TODO: Get this from entryExtensions instead of hardcoded
	// Strip away trailing file extensions
	jsxPath = (jsxPath.endsWith('.jsx') || jsxPath.endsWith('.es6')) ?
		jsxPath.slice(0, -4) :
		(jsxPath.endsWith('.js')) ?
			jsxPath.slice(0, -3) :
			jsxPath;

	while (jsxPath.startsWith('/')) {
		jsxPath = jsxPath.substring(1);
	}

	this.jsxPath = jsxPath;

	return this;
}
