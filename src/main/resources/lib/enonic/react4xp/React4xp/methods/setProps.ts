import type {React4xp as React4xpNamespace} from '../../../../../index.d';


import {isObject} from '@enonic/js-utils/value/isObject';


/** Sets the react4xp component's top-level props.
 * @param props {object} Props to be stored in the component. Must be a string-serializeable object!
 * @returns The react4xp component itself, for builder-like pattern.
 */
export function setProps<
	Props extends {
		react4xpId? :React4xpNamespace.Id
	} = {}
>(props :Props) {
	if (!props || !isObject(props)) {
		throw Error("Top-level props must be a string-serializeable object.");
	}
	this.props = props;
	return this;
}
