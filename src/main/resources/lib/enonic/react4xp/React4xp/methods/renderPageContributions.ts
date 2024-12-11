import type {
	AppConfig,
	UrlType
} from '@enonic-types/lib-react4xp';
import type {
	PageContributions,
	Request
} from '../../../../..';
import type { React4xp } from '../../React4xp';
import { isSet } from '@enonic/js-utils/value/isSet';
//import {toStr} from '@enonic/js-utils/value/toStr';
import { getAssetRoot } from '/lib/enonic/react4xp/dependencies/getAssetRoot';
import { buildErrorContainer } from '/lib/enonic/react4xp/htmlHandling';
import { getAndMerge as getAndMergePageContributions } from '/lib/enonic/react4xp/pageContributions/getAndMerge';
import { IS_DEV_MODE } from '/lib/enonic/react4xp/xp/appHelper';
import isAssumedCSEditMode from '/lib/enonic/react4xp/React4xp/utils/isEditMode';


/** Generates or modifies existing enonic XP pageContributions. Adds client-side dependency chunks (core React4xp frontend,
 * shared libs and components etc, as well as the entry component scripts.
 * Also returns/adds small scripts that trigger the component scripts. Prevents duplicate references to dependencies.
 *
 * @param params {object} Additional parameters controlling the react rendering. All of them are optional:
 *      - pageContributions {object} Pre-existing pageContributions object that will be added BEFORE the new pageContributions rendered here.
 *      - ssr {boolean-y} If ssr is false, renderPageContributions will assume that the react4xp entry is not being rendered
 *          server-side (by .renderBody), and only calls a 'render' command in the client. If omitted or truthy, server-side
 *          rendering is assumed, and a 'hydrate' command is called on the entry instead.
 *      - suppressJS {boolean-y} If truthy, will make sure that the render/hydrate trigger call AND all the JS sources are skipped.
 *      - error {boolean/string} INTERNAL USE: If true boolean, a generic error message is output to the client console error log through page contributions,
 *          and if a string, that message is output. Also, if truthy, the render/hydrate trigger call is suppressed,
 *          in order to keep the error placeholder element visible
 *      TODO: Add option for more graceful failure? Render if error is true, instead of suppressing the trigger and displaying the error placeholder?
 */
export function renderPageContributions(this: React4xp, {
	hydrate,
	pageContributions = {},
	request,
	ssr,
	urlType // default is app.config['react4xp.urlType'] || 'server'
} :{
	hydrate?: boolean,
	pageContributions?: PageContributions,
	request?: Request,
	ssr?: boolean,
	urlType?: UrlType
} = {}) {
	// log.debug('renderPageContributions() hydrate:%s', toStr(hydrate));
	// log.debug('renderPageContributions() pageContributions:%s', toStr(pageContributions));
	// log.debug('renderPageContributions() request:%s', toStr(request));
	// log.debug('renderPageContributions() ssr:%s', toStr(ssr));

	let output = null;
	try {
		// We now believe that client-side render/hydration should work for request.mode:'inline',
		// but is still a bad idea for 'edit' mode as it can interfere with Content Studio UI.
		// When the request.mode is unavailable we assume CS Edit mode.
		//
		// In CS Edit mode there are two "outcomes":
		//  1. Yellow placeholder (Pure client-side component) -> suppressJS
		//  2. SSR without Hydration -> suppressJS
		// Outside CS Edit mode there are three "outcomes":
		//  3. SSR with Hydration -> !suppressJS (and 'hydrate')
		//  4. SSR without Hydration -> suppressJS
		//  5. Client-side render -> !suppressJS (and 'render')
		//
		// The inputs are request.mode, hydrate (+app.config), ssr (+app.config)
		const editMode = isAssumedCSEditMode(request);

		const finalHydrate = isSet(hydrate)
			? hydrate
			: (app.config as AppConfig)['react4xp.hydrate'] !== 'false'; // default is true
		// log.debug('renderPageContributions() jsxPath:%s react4xpId:%s editMode:%s finalHydrate:%s', this.jsxPath, this.react4xpId, editMode, finalHydrate);

		const finalSSR = isSet(ssr)
			? ssr
			: (app.config as AppConfig)['react4xp.ssr'] !== 'false'; // default is true
		// log.debug('renderPageContributions() jsxPath:%s react4xpId:%s editMode:%s finalSSR:%s', this.jsxPath, this.react4xpId, editMode, finalSSR);

		const suppressJS = editMode // 1 or 2
			|| (finalSSR && !finalHydrate); // 4
		// 3 or 5
		// log.debug('renderPageContributions() jsxPath:%s react4xpId:%s editMode:%s finalSSR:%s finalHydrate:%s suppressJS:%s', this.jsxPath, this.react4xpId, editMode, finalSSR, finalHydrate, suppressJS);

		this.ensureAndLockBeforeRendering();

		// NOTE: rollup + typescript + babel doesn't like backslashed inside expression inside backticks.
		let jsonString: string = '';
		if (!suppressJS) {
			jsonString = JSON.stringify({
				command: finalSSR ? 'hydrate' : 'render',
				devMode: IS_DEV_MODE,
				hasRegions: this.hasRegions,
				isPage: this.isPage,
				jsxPath: this.jsxPath,
				props: this.props || {}
			}).replace(/<(\/?script|!--)/gi, "\\u003C$1");
		}

		// TODO: If hasRegions (and isPage?), flag it in props, possibly handle differently?
		const headEnd = suppressJS
			? [] : [
				// Browser-runnable script reference for the react4xp entry. Adds the entry to the browser (available as e.g. React4xp.CLIENT.<jsxPath>), ready to be rendered or hydrated in the browser:
				// '<!-- asset -->',
				`<script defer src="${getAssetRoot({urlType})}${this.assetPath}"></script>\n`,

				// What separates outcome 3 and 5? simply ssr
				`<script data-react4xp-app-name="${app.name}" data-react4xp-ref="${this.react4xpId}" type="application/json">${jsonString}</script>`,
			];
		// log.debug('renderPageContributions() headEnd:%s', toStr(headEnd));

		output = getAndMergePageContributions({
			entryNames: this.jsxPath,
			incomingPgContrib: pageContributions,
			newPgContrib: {
				headEnd
			},
			suppressJS,
			urlType
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
	// log.debug('renderPageContributions() output:%s', toStr(output));
	return output;
} // renderPageContributions
