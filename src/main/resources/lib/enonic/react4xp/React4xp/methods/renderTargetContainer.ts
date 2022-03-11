import {buildContainer} from '../../htmlHandling';
import {
	insertAtEndOfRoot,
	insertInsideContainer
} from '../../html/inserter';
import {bodyHasMatchingIdContainer} from '../bodyHasMatchingIdContainer';


/** Generates or modifies an HTML body, with a target container whose ID matches this component's react4xpId.
 * @param body {string} Existing HTML body, for example rendered from thymeleaf.
 *     If it already has a matching-ID target container, body passes through unchanged (use this option and the
 *     setId method to control where in the body the react component should be inserted). If it doesn't have a
 *     matching container, a matching <div> will be inserted at the end of the body, inside the root element. If
 *     body is missing, a pure-target-container body is generated and returned.
 * @param content {string} HTML content that, if included, is inserted into the container with the matching Id.
 * @returns {string} adjusted or generated HTML body with rendered react component.
 */
export function renderTargetContainer(
	body :string = '', // '' is Falsy
	content :string = '', // '' is Falsy
	appendErrorContainer = false
) {
	this.ensureAndLockId();

	// True if no (or empty) body is supplied:
	const noBody = ((body) + "").replace(/(^\s+)|(\s+$)/g, "") === "";
	// True if a body is supplied but it contains no matching-ID element:
	const noMatch = !noBody && !bodyHasMatchingIdContainer(body, this.react4xpId);

	const output = (!noBody && !noMatch)
		? undefined
		: appendErrorContainer
			? `<div id="${this.react4xpId}__error__" style="border:1px solid #8B0000; padding:15px; background-color:#FFB6C1">${
				content}${
				buildContainer(this.react4xpId)
			}</div>`
			: buildContainer(this.react4xpId, content);


	// If no (or empty) body is supplied: generate a minimal container body with only a target container element.
	if (noBody) {
		return output;
	}

	// If there is a body but it's missing a target container element:
	// Make a container and insert it right before the closing tag.
	if (noMatch) {
		return insertAtEndOfRoot(body, output);
	}

	if (content) {
		return insertInsideContainer(body, content, this.react4xpId, appendErrorContainer);
	}

	return body;
} // renderTargetContainer
