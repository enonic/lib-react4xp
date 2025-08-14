import type {React4xp} from '../../React4xp';


import {buildContainer} from '/lib/enonic/react4xp/html/buildContainer';
import {hasElementWithId} from '/lib/enonic/react4xp/html/hasElementWithId';
import {insertAtEndOfRoot, insertInsideContainer} from '/lib/enonic/react4xp/html/inserter';


interface RenderTargetContainerParams {
	appendErrorContainer?: boolean
	body?: string // '' is Falsy // Html string that usually contains the target container (a DOM node with correct ID).
	content?: string // '' is Falsy // Html string to insert inside the target container.
	wrapper?: boolean
}


/**
 * Generates or modifies an HTML body, with a target container whose ID matches
 *  this component's react4xpId.
 *
 * If it already has a matching-ID target container, data-attributes are added
 *  (use this option and the setId method to control where in the body the react
 *  component should be inserted).
 *
 * If it doesn't have a matching container, a matching <div> will be inserted at
 *  the end of the body, inside the root element.
 *
 * If body is missing, a pure-target-container body is generated and returned.
 *
 * @returns adjusted or generated HTML body with rendered react component.
 */
export function renderTargetContainer(this: React4xp, params: RenderTargetContainerParams): string {
	const {
		wrapper = true,
		appendErrorContainer = false,
		body = '', // '' is Falsy
		content = '' // '' is Falsy
	} = params;
	//log.debug('renderTargetContainer jsxPath:%s', this.jsxPath);
	this.ensureAndLockId();

	const hasBody = ((body) + "").replace(/(^\s+)|(\s+$)/g, "") !== "";
	// log.debug('renderTargetContainer hasBody:%s jsxPath:%s', hasBody, this.jsxPath);

	const hasContainerWithId = hasBody && hasElementWithId({
		id: this.react4xpId,
		htmlString: body
	});
	// log.debug('renderTargetContainer hasBody:%s hasContainerWithId:%s jsxPath:%s', hasBody, hasContainerWithId, this.jsxPath);

	if (hasContainerWithId) {

		if (content) {
			return insertInsideContainer(body, content, this.react4xpId, appendErrorContainer);
		} else {
			return body;
		}

	} else {

		if (wrapper) {
			const container = buildContainer({
				id: this.react4xpId,
				content
			});

			// WARNING: This can end up after the body tag, and gives W3C HTML validation error "Stray start tag"
			return hasBody ? insertAtEndOfRoot(body, container) : container;

		} else {

			if (appendErrorContainer) {
				return `<div id="${this.react4xpId}__error__" style="border:1px solid #8B0000; padding:15px; background-color:#FFB6C1">${content}</div>`;
			} else {
				return content;
			}
		}

	}

} // renderTargetContainer
