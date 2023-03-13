import type {React4xp as React4xpNamespace} from '../../../../../index.d';


import {isString} from 'JS_UTILS_ALIAS/value/isString';
import {React4xp} from '../../React4xp'; // circular dependency?


/** Inner initializer: returns a React4xp component instance initialized from a single set of parameters instead of
 *  the class approach.
 *  @param params {object} MUST include jsxPath or component. All other parameters are optional. If component is included, the jsxPath is automatically inserted to point to a JSX file in the XP component folder, with the same name. This file must exist. If component AND jsxPath are included, jsxPath will override the component name.
 *      - component {object} XP component object (used to extrapolate component part, sufficient if JSX entry file is in the same folder and has the same name).
 *      - jsxPath {string} path to react component entry, see available paths in build/main/resources/react4xp/entries.json after building. These are NAMES, not relative paths. So jsxPath can't contain '..', '//', '/./' or start with '.' or '/'.
 *      - props {object} react props sent in to the component
 *      - id {string} sets the target container element id. If this matches an ID in an input body, the react component will be rendered there. If not, a container with this ID will be added.
 *      - uniqueId {boolean|string} If set, ensures that the ID is unique. If id is set (previous param), a random integer will be postfixed to it. If uniqueId is a string, this is the prefix before the random postfix. If the id param is used in addition to a uniqueId string, uniqueId takes presedence and overrides id.
 */
export function buildFromParams<
	Props extends {
		react4xpId?: React4xpNamespace.Id
	} = object
>({
	entry,
	id,
	uniqueId,
	props
} :{
	entry?: React4xpNamespace.Entry,
	id?: React4xpNamespace.Id,
	uniqueId?: boolean | string,
	props?: Props
} = {}) {
	const react4xp = new React4xp(entry);

	if (props) {
		// TODO: Too much data in props. Consider stripping out unnecessary fields. Remember that props are exposed to client in pageContribution. Stop this?
		/* if (hasRegions && props && !props.component) {
			props.component = component;
		} */
		react4xp.setProps(props);
	}

	if (id) {
		react4xp.setId(id);
	}

	if (uniqueId) {
		if (isString(uniqueId)) {
			react4xp.setId(uniqueId);
		} else {
			react4xp.uniqueId();
		}
	}

	return react4xp;
}
