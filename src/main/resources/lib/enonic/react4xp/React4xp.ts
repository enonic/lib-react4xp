import type {
	PageContributions,
	React4xp as React4xpNamespace,
	Request,
	Response
} from '../../../index.d';
import type {ComponentGeneric} from '../../../types/Component.d';

import {isObject} from '@enonic/js-utils/value/isObject';
import {isString} from '@enonic/js-utils/value/isString';
import {jsxToAssetPath} from '/lib/enonic/react4xp/asset/jsxToAssetPath';
import {
	getContent,
	getComponent
} from '/lib/xp/portal';
import {getDescriptorFromTemplate} from './React4xp/getDescriptorFromTemplate';

// Import public methods
import {checkIdLock} from './React4xp/methods/checkIdLock';
import {ensureAndLockId} from './React4xp/methods/ensureAndLockId';
import {ensureAndLockBeforeRendering} from './React4xp/methods/ensureAndLockBeforeRendering';
import {doRenderSSR} from './React4xp/methods/doRenderSSR';
import {renderBody} from './React4xp/methods/renderBody';
import {renderPageContributions} from './React4xp/methods/renderPageContributions';
import {renderSSRIntoContainer} from './React4xp/methods/renderSSRIntoContainer';
import {renderTargetContainer} from './React4xp/methods/renderTargetContainer';
import {setHasRegions} from './React4xp/methods/setHasRegions';
import {setId} from './React4xp/methods/setId';
import {setIsPage} from './React4xp/methods/setIsPage';
import {setJsxPath} from './React4xp/methods/setJsxPath';
import {setProps} from './React4xp/methods/setProps';
import {uniqueId} from './React4xp/methods/uniqueId';


import {
	buildErrorContainer,
	makeErrorMessage
} from './htmlHandling';
import {setup as setupSSRJava} from './ssr'
import {templateDescriptorCache} from './React4xp/templateDescriptorCache';
import {getClientUrl} from '/lib/enonic/react4xp/asset/client/getClientUrl';
import {getExecutorUrl} from '/lib/enonic/react4xp/asset/executor/getExecutorUrl';
import {getComponentChunkUrls} from '/lib/enonic/react4xp/dependencies/getComponentChunkUrls';


enum BASE_PATHS {
	part = "parts",
	page = "pages",
	layout = "layouts",
}


setupSSRJava();


export class React4xp<
	Props extends {
		react4xpId?: React4xpNamespace.Id
	} = React4xpNamespace.Props
> {
	static getClientUrl = getClientUrl
	static getComponentChunkUrls = getComponentChunkUrls
	static getExecutorUrl = getExecutorUrl

	static _buildFromParams<
		Props extends {
			react4xpId?: React4xpNamespace.Id
		} = object
	>({
		entry,
		id,
		uniqueId,
		props
	}: {
		entry?: React4xpNamespace.Entry,
		id?: React4xpNamespace.Id,
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
		entry: React4xpNamespace.Entry,
		props?: Props,
		request: Request = null,
		options: {
			body?: string
			clientRender?: boolean
			//id?: string // TODO renamed?
			pageContributions?: PageContributions
			react4xpId?: React4xpNamespace.Id
			serveExternals?: boolean
			uniqueId?: boolean|string
		} = {}
	): Response {
		//log.debug('render entry:%s', toStr(entry));
		let react4xp: React4xpNamespace.Instance = null;
		try {
			const dereffedOptions = JSON.parse(JSON.stringify(options)) as {
				body?: string
				entry: React4xpNamespace.Entry,
				clientRender?: boolean
				//id?: string // TODO renamed?
				pageContributions?: PageContributions
				props: Props
				react4xpId?: React4xpNamespace.Id
				serveExternals?: boolean
				uniqueId?: boolean|string
			};
			dereffedOptions.entry = entry; // TODO modifying an incoming object!!!
			if (props && isObject(props) && !Array.isArray(props)) {
				dereffedOptions.props = props;
			} else if (props) {
				throw new Error("React4xp props must be falsy or a regular JS object, not this: " + JSON.stringify(props));
			}

			react4xp = React4xp._buildFromParams<Props>(dereffedOptions);

			const {
				body,
				clientRender,
				pageContributions, // TODO deref?
				serveExternals = true
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
						: { mode: 'inline' },
					serveExternals
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
	}


	// Public fields/properties
	component: ComponentGeneric// = null
	hasRegions: 0|1 = 0        // boolean using 0 for false and 1 for true, for the sake of more compact client-side .render and .hydrate calls.
	isPage: 0|1 = 0            // boolean using 0 for false and 1 for true, for the sake of more compact client-side .render and .hydrate calls.
	jsxPath: string// = null
	assetPath: string// = null
	props: Props// = null
	react4xpId: string// = null
	react4xpIdIsLocked/*: boolean*/ = false

	// Public methods
	public checkIdLock = checkIdLock
	public ensureAndLockId = ensureAndLockId
	public ensureAndLockBeforeRendering = ensureAndLockBeforeRendering
	public doRenderSSR = doRenderSSR
	public renderBody = renderBody
	public renderPageContributions = renderPageContributions
	public renderSSRIntoContainer = renderSSRIntoContainer
	public renderTargetContainer = renderTargetContainer
	public setHasRegions = setHasRegions
	public setId = setId
	public setIsPage = setIsPage
	public setJsxPath = setJsxPath
	public setProps = setProps
	public uniqueId = uniqueId

	constructor(entry: React4xpNamespace.Entry) {
		if (isString(entry)) {
			// Use jsxPath, regular flow
			this.jsxPath = entry.trim();

			if (this.jsxPath === "") {
				throw new Error(`Can't initialize React4xp component with initParam = ${JSON.stringify(entry)}. XP component object or jsxPath string only, please.`);
			}

		} else if (!entry || (isObject(entry) && !Array.isArray(entry))) {
			const comp = getComponent();
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
					this.component = cont.page;

				} else {
					// Missing content.page.descriptor as well as component and jsxPath
					throw new Error("React4xp seems to be called from an invalid context. Looks like you tried to derive jsxPath from a non-jsxPath 'entry' parameter, using either a falsy or component object (portal.getComponent() called from a component controller, i.e. part, layout). But both in-constructor calls portal.getComponent() and portal.getContent() yielded invalid results: no component data and no content.page.  |  entry=" + JSON.stringify(entry) + "  |  portal.getComponent=" + JSON.stringify(comp) + "  |  portal.getContent=" + JSON.stringify(cont));
				}
			}


			const buildingBlockData = {
				descriptor: this.component.descriptor || getDescriptorFromTemplate(this.component.type, this.component.template),
				type: BASE_PATHS[this.component.type],
				path: this.component.path
			};
			Object.keys(buildingBlockData).forEach(attribute => {
				if (!buildingBlockData[attribute]) {
					throw new Error(makeErrorMessage(attribute, this.component));
				}
			});

			const compName = buildingBlockData.descriptor.split(":")[1];
			this.jsxPath = `site/${buildingBlockData.type}/${compName}/${compName}`;

			this.react4xpId = `${buildingBlockData.type}_${compName}_${buildingBlockData.path}`.replace(/\//g, "_");


			// TODO: Move to later in the flow. Where are regions relevant and this.component guaranteed?
			// ------------------------------------------------------------------------------------------
			if (this.component.regions && Object.keys(this.component.regions).length) {
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
	} // constructor
}

export {
	getClientUrl,
	getComponentChunkUrls,
	getExecutorUrl,
}

export const render = React4xp.render;
