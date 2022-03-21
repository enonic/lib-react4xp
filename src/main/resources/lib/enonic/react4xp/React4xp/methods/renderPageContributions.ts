import type {
	PageContributions,
	Request
} from '../../../../..';

//import {toStr} from '@enonic/js-utils/value/toStr';

import {buildErrorContainer} from '../../htmlHandling';
import {getAndMergePageContributions}  from '../../pageContributions';
import {getAssetRoot}  from '../../serviceRoots';

// react4xp_constants.json is not part of lib-react4xp:
// it's an external shared-constants file expected to exist in the build directory of this index.es6.
// Easiest: use <projectRoot>/react4xp.properties and the build.gradle from https://www.npmjs.com/package/react4xp
import {
    //BUILD_ENV,
    LIBRARY_NAME/*,
    R4X_TARGETSUBDIR,
    NASHORNPOLYFILLS_FILENAME,
    EXTERNALS_CHUNKS_FILENAME,
    COMPONENT_STATS_FILENAME,
    ENTRIES_FILENAME,
    SSR_LAZYLOAD,                   // <-- lazyLoading main switch: true/false
    SSR_MAX_THREADS,                // <-- set to 0/undefined/null for unlimited, otherwise a number for an upper concurrency limit (to save memory)
    SSR_ENGINE_SETTINGS*/             // <-- set to 0 to switch off nashorn cache, otherwise cache size (number) or full settings (comma-separated string referring to https://github.com/openjdk/nashorn/blob/main/src/org.openjdk.nashorn/share/classes/org/openjdk/nashorn/internal/runtime/resources/Options.properties )
	//@ts-ignore
//} from '../../react4xp_constants.json';
} from '/lib/enonic/react4xp/react4xp_constants.json';
// TODO: The above (require) doesn't seem to handle re-reading updated files in XP dev runmode. Is that necessary? If so, use dependencies.readResourceAsJson instead!

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
	request
} :{
	pageContributions? :PageContributions,
	clientRender? :boolean,
	request? :Request
} = {}) {
	//log.debug('renderPageContributions() pageContributions:%s', toStr(pageContributions));
	//log.debug('renderPageContributions() clientRender:%s', toStr(clientRender));
	//log.debug('renderPageContributions() request:%s', toStr(request));

	let output = null;
	try {

		// If request.mode reveals rendering in Content studio: SSR without trigger call or JS sources.
		const suppressJS = (request && (request.mode === "edit" || request.mode === "inline"));
		//log.debug('renderPageContributions() suppressJS:%s', toStr(suppressJS));

		const command = clientRender
			? 'render'
			: 'hydrate';
		//log.debug('renderPageContributions() command:%s', toStr(command));

		this.ensureAndLockBeforeRendering();

		// TODO: If hasRegions (and isPage?), flag it in props, possibly handle differently?
		const bodyEnd = (!suppressJS)
			? [
				// Browser-runnable script reference for the react4xp entry. Adds the entry to the browser (available as e.g. React4xp.CLIENT.<jsxPath>), ready to be rendered or hydrated in the browser:
				`<script src="${getAssetRoot()}${this.assetPath}"></script>`,

				// Calls 'render' or 'hydrate' on the entry (e.g. React4Xp.CLIENT.render( ... )), along with the target container ID, and props.
				// Signature: <command>(entry, id, props?, isPage, hasRegions)
				`<script>${
					LIBRARY_NAME}.CLIENT.${command}(${
					LIBRARY_NAME}['${this.jsxPath}'],${
					JSON.stringify(this.react4xpId)},${
					this.props
						? JSON.stringify(this.props)
						: 'null'
				}${
					(this.isPage || this.hasRegions)
						? `,${this.isPage},${this.hasRegions}`
						: ''
				});</script>`
			]
			: [];
		//log.debug('renderPageContributions() bodyEnd:%s', toStr(bodyEnd));

		output = getAndMergePageContributions(
			this.jsxPath, pageContributions, {bodyEnd}, suppressJS
		);

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
