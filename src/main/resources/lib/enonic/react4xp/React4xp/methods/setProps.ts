import type {React4xp} from '../../React4xp';
import {isObject} from '@enonic/js-utils/value/isObject';


/** Sets the react4xp component's top-level props.
 * @param props {object} Props to be stored in the component. Must be a string-serializeable object!
 * @returns The react4xp component itself, for builder-like pattern.
 */
export function setProps<
	Props extends object = object
>(this: React4xp, props: Props) {
	if (!props || !isObject(props)) {
		throw new Error("Top-level props must be a string-serializeable object.");
	}
	this.props = props;
	return this;
}
