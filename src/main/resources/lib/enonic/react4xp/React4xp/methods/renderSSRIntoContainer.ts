import type {
	React4xp,
	Request
} from '../../../../..';

import {buildErrorContainer} from '../../htmlHandling';


/** Server-side rendering: Renders a static HTML markup and inserts it into an ID-matching target container in an HTML body. This is the same as renderBody({body: body}). If a
 * matching-ID container (or a body) is missing, it will be generated.
 * @param body {string} Existing HTML body, for example rendered from thymeleaf.
 * @returns {string} adjusted or generated HTML body with rendered react component.
 */
export function renderSSRIntoContainer({
	body,
	clientRender = true,
	react4xpObj,
	request
} : {
	body :string
	clientRender? :boolean
	react4xpObj :React4xp.Instance
	request :Request
}) :string {
	const { html, error } = this.doRenderSSR();
	return error
		? this.renderTargetContainer({
			appendErrorContainer: true,
			body,
			clientRender,
			content: buildErrorContainer(
				"React4xp SSR error",
				error,
				request,
				react4xpObj,
				false
			),
		})
		: this.renderTargetContainer({
			body,
			clientRender,
			content: html
		});
} // renderSSRIntoContainer
