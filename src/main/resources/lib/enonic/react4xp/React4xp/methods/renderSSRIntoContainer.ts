import type {Request} from '@enonic-types/core';
import type {React4xp} from '../../React4xp';


import {buildErrorContainer} from '/lib/enonic/react4xp/htmlHandling';


/** Server-side rendering: Renders a static HTML markup and inserts it into an ID-matching target container in an HTML body. This is the same as renderBody({body: body}). If a
 * matching-ID container (or a body) is missing, it will be generated.
 * @param body {string} Existing HTML body, for example rendered from thymeleaf.
 * @param request Current HTTP request
 * @param wrapper Flag to turn generation of wrapper on/off if not found in body
 * @returns {string} adjusted or generated HTML body with rendered react component.
 */
export function renderSSRIntoContainer(this: React4xp, {
	body,
	request,
	wrapper
}: {
	body: string
	request: Request,
	wrapper?: boolean
}): string {
	//log.debug('renderSSRIntoContainer jsxPath:%s', this.jsxPath);
	const { html, error } = this.doRenderSSR();
	//log.debug('renderSSRIntoContainer after doRenderSSR jsxPath:%s html:%s ', this.jsxPath, html);
	return error
		? this.renderTargetContainer({
			appendErrorContainer: true,
			body,
			wrapper,
			content: buildErrorContainer(
				"React4xp SSR error",
				error,
				request,
				this,
				false
			),
		})
		: this.renderTargetContainer({
			body,
			wrapper,
			content: html
		});
} // renderSSRIntoContainer
