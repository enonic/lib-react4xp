import type {
	Component,
	Props
} from './index.d';


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
	ReactDOM.hydrate(renderable, container);
}
