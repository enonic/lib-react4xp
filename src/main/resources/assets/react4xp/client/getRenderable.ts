import type {
	Component,
	ComponentFunction,
	ComponentObject,
	Props
} from './index.d';


function isComponentFunction(value :unknown) :value is ComponentFunction {
	return typeof value === 'function'
}

function isComponentObject(component :unknown) :component is ComponentObject {
	return typeof component === 'object'
}


export const getRenderable = (
	component :Component,
	props :Props
) =>
	isComponentFunction(component)
		? component(props)
		: isComponentObject(component)
			? (
				isComponentFunction(component.default)
					? component.default(props)
					: component.default
			)
			: component
