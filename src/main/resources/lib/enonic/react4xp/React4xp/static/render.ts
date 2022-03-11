import type {
	PageContributions,
	React4xp as React4xpNamespace,
	Request,
	Response
} from '../../../../../index.d';


import {isObject} from '@enonic/js-utils/value/isObject';
import {toStr} from '@enonic/js-utils/value/toStr';

import {buildFromParams} from './buildFromParams';
import {buildErrorContainer} from '../../htmlHandling';


const isArray = Array.isArray;


///////////////////////////////////////////////// STATIC ALL-IN-ONE RENDERER

/** Main renderer. Default behavior: renders server-side and adds hydration logic for the client-side.
 *     However, renders a static, unhydrated server-side HTML string if request is missing or in edit mode.
 *     Or can render a container element with client-side rendering logic.
 *     On problems/errors, logs and falls back to a placeholder output which marks the problem on the page.
 *
 * @param entry {string|object} Reference to the React4xp entry JSX file. Corresponds to "view" parameter in the
 *      thymeleaf renderer etc. Can be a string or an object: If it's a string, it's interpreted as a jsxPath. If it's an
 *      object, it's interpreted as a component object from portal.getComponent(), and will be used to both find the JSX
 *      file (same name in same folder) and generate a unique ID (see also the params below). Note: current versions of
 *      XP (6.x, 7.0, 7.1 and probably 7.2 too) are not able to fetch a usable component object from a page controller.
 *      In this case, component will simply be null. There is a workaround in place for this (detecting page controller
 *      and using content.page instead), so it's currently possible to juse pass  null/undefined as the first argument
 *      from a page controller, and it will still work. However, this seems to be a bug in XP, so the bug might get fixed
 *      later and the workaround possibly removed To ensure future compatibility, you're recommended to to call
 *      getComponent() in the page controller and pass that to render, all the same.
 * @param props {object} Optional object. Sends props to the JSX file. Corresponds to "model" parameter in the
 *      thymeleaf renderer etc.
 * @param request {object} XP request object (from controller get-method etc). Mandatory for proper react rendering,
 *          but strictly speaking optional:
 *     - If omitted, the rendering will fall back to a template-like JSX rendering: outputs a static HTML string using the props,
 *          and it will not be activated/hydrated in the client. If only the static output is of interest, doing this may
 *          increase performance, since page contributions aren't rendered.
 * @param options {object} Additional parameters controlling the react rendering. All of them are optional:
 *     - clientRender {boolean} Controls server-side vs client-side rendering (as long as a request argument is given, see above).
 *         Server-side rendering (SSR) is the default behavior if this parameter is missing or falsy: a static HTML string is rendered as output, and react hydrate() pageContributions are added.
 *         If set to true, however, client-side rendering is forced: only a target container with an element ID is rendered in the output, but react render() pageContributions are added.
 *     - id {string} sets the target container element ID.
 *         (by force - if an ID was generated from a component-type entry object (see above), this manual ID will override the generated one).
 *         If the ID matches an DOM element ID in an input body (see body below), the rendered react component will be inserted in that element. If not, a container with this ID will be added.
 *         If there's no body parameter at all, an HTML string with a matching-ID element is generated.
 *         If the id parameter is omitted, a generic unique ID is generated as if uniqueId below is set to true.
 *     - uniqueId {boolean|string} If set, takes an extra step to ensure a unique ID:
 *         If id is already set (by previous param or using a component-object entry), a random integer will be postfixed to it.
 *         If uniqueId is a string, this is the prefix before the random postfix. If the id param is used in addition to a uniqueId string, uniqueId takes presedence and overrides id.
 *     - body {string} HTML string, for example a static string, or previously rendered from other react4xp output, thymeleaf or other templating engines.
 *         If it already has a matching-ID target container, body passes through unchanged (use this option and the setId method to control where in the body the react component should be inserted).
 *         If it doesn't have a matching container, a matching <div> will be inserted at the end of the body, inside the root element.
 *         If body is missing, a pure-target-container body is generated and returned.
 *     - pageContributions {object} Pre-existing pageContributions.
 *         If added, page contributions generated during this rendering will be added to (merged with) the input parameter ones.
 *
 * @returns a response object that can be directly returned from an XP controller, with body and pageContributions attributes
 */
export function render<
	Props extends object = {}
>(
	entry :React4xpNamespace.Entry,
	props? :Props,
	request :Request = null,
	options :{
		body? :string
		clientRender? :boolean
		//id? :string // TODO renamed?
		pageContributions? :PageContributions
		react4xpId? :React4xpNamespace.Id
		uniqueId? :boolean|string
	} = {}
) :Response {
	//log.debug('render entry:%s', toStr(entry));
	let react4xp :React4xpNamespace.Class = null;
	try {
		const dereffedOptions = JSON.parse(JSON.stringify(options)) as {
			body? :string
			entry :React4xpNamespace.Entry,
			clientRender? :boolean
			//id? :string // TODO renamed?
			pageContributions? :PageContributions
			props :Props
			react4xpId? :React4xpNamespace.Id
			uniqueId? :boolean|string
		};
		dereffedOptions.entry = entry; // TODO modifying an incoming object!!!
		if (props && isObject(props) && !isArray(props)) {
			dereffedOptions.props = props;
		} else if (props) {
			throw new Error("React4xp props must be falsy or a regular JS object, not this: " + JSON.stringify(props));
		}

		react4xp = buildFromParams<Props>(dereffedOptions);

		const {
			body,
			clientRender,
			pageContributions
		} = options || {};

		return {
			...dereffedOptions,

			// .render without a request object will enforce SSR
			body: react4xp.renderBody({
				body,
				clientRender: request
					? clientRender
					: false,
				request
			}),

			// .render without a request object will enforce JS-suppressed renderPageContributions
			pageContributions: react4xp.renderPageContributions({
				pageContributions,
				clientRender,
				request: request
					? request
					: { mode: 'inline' }
			})
		}

	} catch (e) {
		log.error('Stacktrace', e);
		log.error("entry (" + typeof entry + "): " + JSON.stringify(entry));
		log.error("props (" + typeof props + "): " + JSON.stringify(props));
		log.error("request (" + typeof request + "): " + JSON.stringify(request));
		log.error("params (" + typeof options + "): " + JSON.stringify(options));
		const errObj = react4xp || {
			react4xpId: (options || {}).react4xpId,
			jsxPath: entry
		};

		return {
			body: buildErrorContainer(
				"React4xp error during rendering",
				e.message,
				request,
				errObj
			)
		};
	} // try/catch
} // static render
