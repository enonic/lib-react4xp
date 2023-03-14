import type {
	Component,
	Props
} from './index.d';


import {isFunction} from 'JS_UTILS_ALIAS/value/isFunction';
import ReactDOM from 'react-dom';
import {getContainer} from './getContainer';
import {getRenderable} from './getRenderable';
import {postFillRegions} from './postFillRegions';


export function render(
	component: Component,
	targetId: string,
	props: Props,
	//@ts-expect-error TS6133: 'isPage' is declared but its value is never read.
	isPage: number, //boolean, // 0 means false
	hasRegions: number, //boolean, // 0 means false
	isDevMode: number //boolean // 0 means false
) {
	const container = getContainer(targetId);
	const renderable = getRenderable(component, props);
	if (isFunction(ReactDOM.createRoot)) {
		ReactDOM.createRoot(container).render(renderable); // React 18
	} else {
		ReactDOM.render(renderable, container); // React 17
	}

	if (hasRegions) {
		postFillRegions(props, isDevMode);
	}
}
