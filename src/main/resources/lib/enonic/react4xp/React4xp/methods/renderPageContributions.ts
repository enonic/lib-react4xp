import type {
	PageContributions,
	Request
} from '../../../../..';


//import {toStr} from '@enonic/js-utils/value/toStr';

import {dynamicScript} from '/lib/enonic/react4xp/asset/dynamic';
import {getAssetRoot} from '/lib/enonic/react4xp/dependencies/getAssetRoot';
import {buildErrorContainer} from '/lib/enonic/react4xp/htmlHandling';
import {encodeForInlineJson} from '/lib/enonic/react4xp/html/encodeForInlineJson';
import {getAndMerge as getAndMergePageContributions} from '/lib/enonic/react4xp/pageContributions/getAndMerge';
import {IS_DEV_MODE} from '/lib/enonic/xp/runMode';


/** Generates or modifies existing enonic XP pageContributions. Adds client-side dependency chunks (core React4xp frontend,
 * shared libs and components etc, as well as the entry component scripts.
 * Also returns/adds small scripts that trigger the component scripts. Prevents duplicate references to dependencies.
 *
 * @param params {object} Additional parameters controlling the react rendering. All of them are optional:
 *      - pageContributions {object} Pre-existing pageContributions object that will be added BEFORE the new pageContributions rendered here.
 *      - clientRender {boolean-y} If clientRender is truthy, renderPageContributions will assume that the react4xp entry is not being rendered
 *          server-side (by .renderBody), and only calls a 'render' command in the client. If omitted or falsy, server-side
 *          rendering is assumed, and a 'hydrate' command is called on the entry instead.
 *      - suppressJS {boolean-y} If truthy, will make sure that the render/hydrate trigger call AND all the JS sources are skipped.
 *      - error {boolean/string} INTERNAL USE: If true boolean, a generic error message is output to the client console error log through page contributions,
 *          and if a string, that message is output. Also, if truthy, the render/hydrate trigger call is suppressed,
 *          in order to keep the error placeholder element visible
 *      TODO: Add option for more graceful failure? Render if error is true, instead of suppressing the trigger and displaying the error placeholder?
 */
export function renderPageContributions({
	pageContributions = {},
	clientRender,
	request,
	serveExternals = true
} :{
	pageContributions? :PageContributions,
	clientRender? :boolean,
	request? :Request,
	serveExternals? :boolean
} = {}) {
	//log.debug('renderPageContributions() pageContributions:%s', toStr(pageContributions));
	//log.debug('renderPageContributions() clientRender:%s', toStr(clientRender));
	//log.debug('renderPageContributions() request:%s', toStr(request));

	let output = null;
	try {

		// If request.mode reveals rendering in Content studio: SSR without trigger call or JS sources.
		const suppressJS = (request && (request.mode === "edit" || request.mode === "inline"));
		//log.debug('renderPageContributions() suppressJS:%s', toStr(suppressJS));

		this.ensureAndLockBeforeRendering();

		// TODO: If hasRegions (and isPage?), flag it in props, possibly handle differently?
		const bodyEnd = (!suppressJS)
			? [
				// Browser-runnable script reference for the react4xp entry. Adds the entry to the browser (available as e.g. React4xp.CLIENT.<jsxPath>), ready to be rendered or hydrated in the browser:
				`<script src="${getAssetRoot()}${this.assetPath}"></script>\n`,

				`<script data-react4xp-ref="${this.react4xpId}" type="application/json">${encodeForInlineJson({
					command: clientRender ? 'render' : 'hydrate',
					devMode: IS_DEV_MODE,
					hasRegions: this.hasRegions,
					isPage: this.isPage,
					jsxPath: this.jsxPath,
					props: this.props || {}
				})}</script>`,

				dynamicScript(`(() => {
const inlineJsonElements = Array.from(document.querySelectorAll('script[data-react4xp-ref][type="application/json"]'));
for (let index = 0; index < inlineJsonElements.length; index++) {
	const inlineJsonElement = inlineJsonElements[index];

	const id = inlineJsonElement.dataset.react4xpRef;
	//console.debug('id', id);

	const json = inlineJsonElement.textContent;
	//console.debug('json', json);

	const decodedJson = json.replace(/&#60;/g,'<');
	//console.debug('decodedJson', decodedJson);

	let data = {};
	try {
		data = JSON.parse(decodedJson);
	} catch (e) {
		console.error('Something went wrong while trying to JSON.parse('+json+')');
	}
	//console.debug('data', data);

	const {
		command,
		devMode,
		hasRegions,
		isPage,
		jsxPath,
		props
	} = data;
	/*console.debug('command', command);
	console.debug('devMode', devMode);
	console.debug('hasRegions', hasRegions);
	console.debug('isPage', isPage);
	console.debug('jsxPath', jsxPath);
	console.debug('props', props);*/
	React4xp.CLIENT[command](React4xp[jsxPath],id,props,isPage,hasRegions,devMode);
} // for
})();`, true)
			]
			: [];
		//log.debug('renderPageContributions() bodyEnd:%s', toStr(bodyEnd));

		output = getAndMergePageContributions({
			entryNames: this.jsxPath,
			incomingPgContrib: pageContributions,
			newPgContrib: {
				bodyEnd
			},
			suppressJS,
			serveExternals
		});

	} catch (e) {
		log.error(e);
		const {headBegin, headEnd, bodyBegin, bodyEnd } = pageContributions;
		output = {
			headBegin,
			headEnd,
			bodyEnd,
			bodyBegin: [
				...(bodyBegin || []),
				buildErrorContainer(
					"React4xp renderPageContributions error",
					e.message,
					request,
					this
				)
			],
		};
	}
	//log.debug('renderPageContributions() output:%s', toStr(output));
	return output;
} // renderPageContributions
