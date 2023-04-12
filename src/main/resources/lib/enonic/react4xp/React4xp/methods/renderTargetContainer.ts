import type {React4xp} from '../../React4xp';


import {buildContainer} from '/lib/enonic/react4xp/html/buildContainer';
import {hasElementWithId} from '/lib/enonic/react4xp/html/hasElementWithId';
import {
	insertAtEndOfRoot,
	insertInsideContainer
} from '/lib/enonic/react4xp/html/inserter';


interface RenderTargetContainerParams {
	appendErrorContainer?: boolean
	body?: string // '' is Falsy // Html string that usually contains the target container (a DOM node with correct ID).
	content?: string // '' is Falsy // Html string to insert inside the target container.
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
		appendErrorContainer = false,
		body = '', // '' is Falsy
		content = '' // '' is Falsy
	} = params;
	//log.debug('renderTargetContainer jsxPath:%s', this.jsxPath);
	this.ensureAndLockId();

	const hasBody = ((body) + "").replace(/(^\s+)|(\s+$)/g, "") !== "";
	// log.debug('renderTargetContainer hasBody:%s jsxPath:%s', hasBody, this.jsxPath);

	const hasContainerWithId = hasElementWithId({
		id: this.react4xpId,
		htmlString: body
	});
	// log.debug('renderTargetContainer hasBody:%s hasContainerWithId:%s jsxPath:%s', hasBody, hasContainerWithId, this.jsxPath);

	const container = buildContainer({
		id: this.react4xpId,
		content
	});

	const output = (hasBody && hasContainerWithId)
		? undefined
		: appendErrorContainer
			? `<div id="${this.react4xpId}__error__" style="border:1px solid #8B0000; padding:15px; background-color:#FFB6C1">${
				content}${container})
			}</div>`
			: container;


	// If no (or empty) body is supplied: generate a minimal container body with only a target container element.
	if (!hasBody) {
		return output;
	}

	// If there is a body but it's missing a target container element:
	// Make a container and insert it right before the closing tag.
	if (!hasContainerWithId) {
		// log.debug(
		// 	'renderTargetContainer hasBody:%s hasContainerWithId:%s jsxPath:%s id:%s body:%s output:%s',
		// 	hasBody, hasContainerWithId, this.jsxPath, this.react4xpId, body, output
		// );
		// WARNING: This can end up after the body tag, and gives W3C HTML validation error "Stray start tag"
		return insertAtEndOfRoot(body, output);
	}

	if (content) {
		// log.debug(
		// 	'renderTargetContainer hasBody:%s hasContainerWithId:%s jsxPath:%s id:%s body:%s content:%s',
		// 	hasBody, hasContainerWithId, this.jsxPath, this.react4xpId, body, content
		// );
		return insertInsideContainer(body, content, this.react4xpId, appendErrorContainer);
	}

	return body;
} // renderTargetContainer
