import type {
	Component,
	Props
} from './index.d';


import {isFunction} from '@enonic/js-utils/value/isFunction';
import ReactDOM from 'react-dom';
import {getContainer} from './getContainer';
import {getRenderable} from './getRenderable';


export function hydrate(
	component: Component,
	targetId: string,
	props: Props/*,
	isPage: boolean,
	hasRegions: boolean*/
) {
	const container = getContainer(targetId);
	const renderable = getRenderable(component, props);
	if (isFunction(ReactDOM.hydrateRoot)) {
		ReactDOM.hydrateRoot(container, renderable); // React 18
	} else {
		ReactDOM.hydrate(renderable, container);  // React 17
	}
}
