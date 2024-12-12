import type {
	Component,
	PageContributions,
	Request,
	Response,
} from '@enonic-types/core';
import type {
	Entry,
	Id,
	Instance,
	// React4xp as React4xpNamespace,
	UrlType
} from '@enonic-types/lib-react4xp';

import { hasOwnProperty } from '@enonic/js-utils/object/hasOwnProperty';
import { isObject } from '@enonic/js-utils/value/isObject';
import { isString } from '@enonic/js-utils/value/isString';
import { isNotSet } from '@enonic/js-utils/value/isNotSet';
// import { toStr } from '@enonic/js-utils/value/toStr';
import { jsxToAssetPath } from '/lib/enonic/react4xp/asset/jsxToAssetPath';
import {
	getContent,
	getComponent
} from '/lib/xp/portal';
import { getDescriptorFromTemplate } from '/lib/enonic/react4xp/React4xp/getDescriptorFromTemplate';

// Import public methods
import { checkIdLock } from '/lib/enonic/react4xp/React4xp/methods/checkIdLock';
import { ensureAndLockId } from '/lib/enonic/react4xp/React4xp/methods/ensureAndLockId';
import { ensureAndLockBeforeRendering } from '/lib/enonic/react4xp/React4xp/methods/ensureAndLockBeforeRendering';
import { doRenderSSR } from '/lib/enonic/react4xp/React4xp/methods/doRenderSSR';
import makeErrorMessage from "/lib/enonic/react4xp/React4xp/methods/makeErrorMessage";
import { renderBody } from '/lib/enonic/react4xp/React4xp/methods/renderBody';
import { renderPageContributions } from '/lib/enonic/react4xp/React4xp/methods/renderPageContributions';
import { renderSSRIntoContainer } from '/lib/enonic/react4xp/React4xp/methods/renderSSRIntoContainer';
import { renderTargetContainer } from '/lib/enonic/react4xp/React4xp/methods/renderTargetContainer';
import { renderWarningPlaceholder } from '/lib/enonic/react4xp/React4xp/methods/renderWarningPlaceholder';
import { setHasRegions } from '/lib/enonic/react4xp/React4xp/methods/setHasRegions';
import { setId } from '/lib/enonic/react4xp/React4xp/methods/setId';
import { setIsPage } from '/lib/enonic/react4xp/React4xp/methods/setIsPage';
import { setJsxPath } from '/lib/enonic/react4xp/React4xp/methods/setJsxPath';
import { setProps } from '/lib/enonic/react4xp/React4xp/methods/setProps';
import { uniqueId } from '/lib/enonic/react4xp/React4xp/methods/uniqueId';


import { buildErrorContainer } from '/lib/enonic/react4xp/htmlHandling';
import { setup as setupSSRJava } from '/lib/enonic/react4xp/ssr/index'
import { templateDescriptorCache } from '/lib/enonic/react4xp/React4xp/templateDescriptorCache';
import { getClientUrl } from '/lib/enonic/react4xp/asset/client/getClientUrl';
import { getExecutorUrl } from '/lib/enonic/react4xp/asset/executor/getExecutorUrl';
import { getComponentChunkUrls } from '/lib/enonic/react4xp/dependencies/getComponentChunkUrls';


interface RenderOptions {
	body?: string
	hydrate?: boolean
	id?: Id
	pageContributions?: PageContributions
	ssr?: boolean
	urlType?: UrlType
	uniqueId?: boolean|string
}


enum BASE_PATHS {
	part = "parts",
	page = "pages",
	layout = "layouts",
}


setupSSRJava();


export class React4xp<
	Props extends object = object
> {
	static getClientUrl = getClientUrl
	static getComponentChunkUrls = getComponentChunkUrls
	static getExecutorUrl = getExecutorUrl

	static _buildFromParams<
		Props extends object = object
	>({
		entry,
		id,
		uniqueId,
		props
	}: {
		entry?: Entry,
		id?: Id,
		uniqueId?: boolean | string,
		props?: Props
	} = {}) {
		const react4xp = new React4xp(entry);

		if (props) {
			// TODO: Too much data in props. Consider stripping out unnecessary fields. Remember that props are exposed to client in pageContribution. Stop this?
			/* if (hasRegions && props && !props.component) {
				props.component = component;
			} */
			react4xp.setProps(props);
		}

		if (id) {
			react4xp.setId(id);
		}

		if (uniqueId) {
			if (isString(uniqueId)) {
				react4xp.setId(uniqueId);
			} else {
				react4xp.uniqueId();
			}
		}

		return react4xp;
	}

	static _clearCache() {
		templateDescriptorCache.clear();
	}

	static render<
		Props extends object = object
	>(
		entry: Entry,
		props?: Props, // Question: Optional positional parameter, before required ones, seems invalid to me?
		request: Request = null,
		options: RenderOptions = {}
	): Response {
		// log.debug('render entry:%s props:%s options:%s request:%s', toStr(entry), toStr(props), toStr(options), toStr(request));
		// log.info('render entry:%s props:%s options:%s', toStr(entry), toStr(props), toStr(options));
		let react4xp: Instance = null;
		try {
			const dereffedOptions = JSON.parse(JSON.stringify(options)) as typeof options & {
				entry: Entry,
				props: Props
			};
			dereffedOptions.entry = isString(entry) ? entry : JSON.parse(JSON.stringify(entry));

			// If ssr is set to false in app.config, it shouldn't apply to page
			// & layout, because only SSR works well for page and layout.
			// We've still made it possible to try out client-side rendering for
			// page & layout by setting it directly in render options.
			// NOTE: When automatic page template is used the page component is just an empty object, there is no type property.
			if(isObject(entry) && (entry?.['type'] === 'page' || entry?.['type'] === 'layout' || !hasOwnProperty(entry, 'type'))) {
				if (isNotSet(dereffedOptions.ssr)) {
					dereffedOptions.ssr = true;
				}
			}

			if (props && isObject(props) && !Array.isArray(props)) {
				dereffedOptions.props = props;
			} else if (props) {
				throw new Error("React4xp props must be falsy or a regular JS object, not this: " + JSON.stringify(props));
			}

			react4xp = React4xp._buildFromParams<Props>(dereffedOptions);

			const {
				body,
				hydrate,
				pageContributions, // TODO deref?
				ssr,
				urlType // default is app.config['react4xp.urlType'] || 'server'
			} = dereffedOptions || {};

			return {
				// I think render() should return a Enonic XP response object, that's at least what the typings say.
				// dereffedOptions contains properties which doesn't belong in an Enonic XP response object
				// TODO: So this is not "safe":
				...dereffedOptions,

				// .render without a request object will enforce SSR
				body: react4xp.renderBody({
					body,
					request,
					ssr
				}),

				// .render without a request object will enforce JS-suppressed renderPageContributions
				pageContributions: react4xp.renderPageContributions({
					hydrate,
					pageContributions,
					request,
					ssr,
					urlType,
				})
			}

		} catch (e) {
			log.error('Stacktrace', e);
			log.error("entry (" + typeof entry + "): " + JSON.stringify(entry));
			log.error("props (" + typeof props + "): " + JSON.stringify(props));
			log.error("request (" + typeof request + "): " + JSON.stringify(request));
			log.error("params (" + typeof options + "): " + JSON.stringify(options));
			const errObj = react4xp || {
				react4xpId: (options || {}).id,
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
	} // React4xp.render


	// Public fields/properties
	component: Component// = null
	hasRegions: 0|1 = 0        // boolean using 0 for false and 1 for true, for the sake of more compact client-side .render and .hydrate calls.
	isPage: 0|1 = 0            // boolean using 0 for false and 1 for true, for the sake of more compact client-side .render and .hydrate calls.
	jsxPath: string// = null
	assetPath: string// = null
	props: Props// = null
	react4xpId: Id// = null
	react4xpIdIsLocked/*: boolean*/ = false

	// Public methods
	public checkIdLock = checkIdLock
	public ensureAndLockId = ensureAndLockId
	public ensureAndLockBeforeRendering = ensureAndLockBeforeRendering
	public doRenderSSR = doRenderSSR
	public makeErrorMessage = makeErrorMessage
	public renderBody = renderBody
	public renderPageContributions = renderPageContributions
	public renderSSRIntoContainer = renderSSRIntoContainer
	public renderTargetContainer = renderTargetContainer
	public renderWarningPlaceholder = renderWarningPlaceholder
	public setHasRegions = setHasRegions
	public setId = setId
	public setIsPage = setIsPage
	public setJsxPath = setJsxPath
	public setProps = setProps
	public uniqueId = uniqueId

	constructor(entry: Entry) {
		// log.debug('React4xp constructor entry:%s', entry);

		if (isString(entry)) {
			// Use jsxPath, regular flow
			this.jsxPath = entry.trim();

			if (this.jsxPath === "") {
				throw new Error(`Can't initialize React4xp component with initParam = ${JSON.stringify(entry)}. XP component object or jsxPath string only, please.`);
			}

		} else if (!entry || (isObject(entry) && !Array.isArray(entry))) {
			const comp = getComponent();
			// log.debug('React4xp constructor comp:%s', comp);

			if (comp) {
				// Component. Use entry in component flow. Derive jsxPath and default ID from local part/layout folder, same name.
				this.component = entry || comp;
			} else {
				const cont = getContent();
				if (cont && cont.page) {
					// TODO: In the long run, it would be better with a more reliable test than !component for whether this is a top-level entry call specifically from a page controller.
					//       Especially since page-view entries that are called from the controller by jsxPath instead of by component, will be unable to detect if its a page.
					//       Make a Content.getPage() call from a bean? And if it fails, this fallback should be skipped since this wasn't called from a page controller.
					// Page. Use content.page in page flow. Derive jsxPath and default ID from local page folder, same name.
					this.isPage = 1;
					// @ts-expect-error TODO
					this.component = cont.page;
				} else {
					// Missing content.page.descriptor as well as component and jsxPath
					throw new Error("React4xp seems to be called from an invalid context. Looks like you tried to derive jsxPath from a non-jsxPath 'entry' parameter, using either a falsy or component object (portal.getComponent() called from a component controller, i.e. part, layout). But both in-constructor calls portal.getComponent() and portal.getContent() yielded invalid results: no component data and no content.page.  |  entry=" + JSON.stringify(entry) + "  |  portal.getComponent=" + JSON.stringify(comp) + "  |  portal.getContent=" + JSON.stringify(cont));
				}
			}
			// log.debug('React4xp constructor this.component:%s', this.component);

			const buildingBlockData = {
				descriptor: this.component['descriptor'] || getDescriptorFromTemplate(this.component.type, this.component['template']),
				type: BASE_PATHS[this.component.type],
				path: this.component.path
			};
			// log.debug('React4xp constructor buildingBlockData:%s', buildingBlockData);

			if (!this.component.path) {
				const maybeFragmentContent = getContent();
				// log.debug('React4xp constructor maybeFragmentContent:%s', toStr(maybeFragmentContent));
				// The actual node stores components on a flattened array, while getContent has a nested structure under fragment.
				// // @ts-expect-error TS2339: Property 'fragment' does not exist on type
				if (
					maybeFragmentContent
					&& maybeFragmentContent.type === 'portal:fragment'
					&& maybeFragmentContent.fragment
				) {
					// #51 Support rendering fragment content
					// getComponent() inside Fragment Content doesn't contain path
					// The path is used when creating react4xpId
					// Since a Fragment Content only has a single component, the path really doesn't matter...
					buildingBlockData.path = '/';
				}
			}
			// log.debug('React4xp constructor buildingBlockData:%s', buildingBlockData);

			Object.keys(buildingBlockData).forEach(attribute => {
				// log.debug('React4xp constructor attribute:%s', attribute);
				if (!buildingBlockData[attribute]) {
					throw new Error(this.makeErrorMessage(attribute));
				}
			});

			const compName = buildingBlockData.descriptor.split(":")[1];
			// log.debug('React4xp constructor compName:%s', compName);

			this.jsxPath = `site/${buildingBlockData.type}/${compName}/${compName}`;
			// log.debug('React4xp constructor this.jsxPath:%s', this.jsxPath);

			this.react4xpId = `${buildingBlockData.type}_${compName}_${buildingBlockData.path}`.replace(/\//g, "_");
			// log.debug('React4xp constructor this.react4xpId:%s', this.react4xpId);


			// TODO: Move to later in the flow. Where are regions relevant and this.component guaranteed?
			// ------------------------------------------------------------------------------------------
			if (this.component['regions'] && Object.keys(this.component['regions']).length) {
				this.hasRegions = 1;
			} else if (this.isPage) {
				log.debug("React4xp appears to be asked to render a page. No regions are found.  |  entry=" + JSON.stringify(entry) + "  |  portal.getComponent=" + JSON.stringify(getComponent()) + "  |  portal.getContent=" + JSON.stringify(getContent));
			}
			// ------------------------------------------------------------------------------------------


		} else {
			// Missing entry
			throw new Error("React4xp got an invalid 'entry' reference. Either use falsy, a jsxPath string, or a component object (portal.getComponent() called from a component controller, i.e. part, layout). entry=" + JSON.stringify(entry));
		}

		this.assetPath = jsxToAssetPath(this.jsxPath);
		// log.debug('React4xp constructor this.assetPath:%s', this.assetPath);
	} // constructor
}

export {
	getClientUrl,
	getComponentChunkUrls,
	getExecutorUrl,
}

export const render = React4xp.render;
