import type {React4xp} from '../../React4xp';


import endsWith from '@enonic/js-utils/string/endsWith';
import {startsWith} from '@enonic/js-utils/string/startsWith';


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
export function setJsxPath(this: React4xp, jsxPath :string) {
	// Enforce a clean jsxPath - it's not just a file reference, but a react4xp component name!
	this.checkIdLock()
	if (
		(jsxPath || '').trim() === '' ||
		startsWith(jsxPath, '.') ||
		startsWith(jsxPath, '/') ||
		jsxPath.indexOf('..') !== -1 ||
		jsxPath.indexOf('/./') !== -1 ||
		jsxPath.indexOf('//') !== -1 ||
		jsxPath.indexOf('\\.\\') !== -1 ||
		jsxPath.indexOf('\\\\') !== -1 ||
		startsWith(jsxPath, "\\")
	) {
		throw new Error(`React4xp.setJsxFileName: invalid jsxPath (${JSON.stringify(jsxPath)}). This is a NAME, not a relative path, so it can't be missing/empty, or contain '..', '//', '/./' or start with '.' or '/'.${this.component ? ` Component: ${JSON.stringify(this.component)}` : ''}`);
	}

	// TODO: Get this from entryExtensions instead of hardcoded
	// Strip away trailing file extensions
	jsxPath = (endsWith(jsxPath, '.jsx') || endsWith(jsxPath, '.es6')) ?
		jsxPath.slice(0, -4) :
		(endsWith(jsxPath, '.js')) ?
			jsxPath.slice(0, -3) :
			jsxPath;

	while (startsWith(jsxPath, '/')) {
		jsxPath = jsxPath.substring(1);
	}

	this.jsxPath = jsxPath;

	return this;
}
