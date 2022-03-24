import type {React4xp as React4xpNamespace} from '../../../..';


import {isObject} from '@enonic/js-utils/value/isObject';
import {isString} from '@enonic/js-utils/value/isString';
//import {toStr} from '@enonic/js-utils/value/toStr';


import {
	getContent,
	getComponent
	//@ts-ignore
}  from '/lib/xp/portal';

import {makeErrorMessage} from '../htmlHandling';
import {getDescriptorFromTemplate} from './getDescriptorFromTemplate';
import {jsxToAssetPath} from '/lib/enonic/react4xp/asset/jsxToAssetPath';

// Import public methods
import {checkIdLock} from './methods/checkIdLock';
import {ensureAndLockId} from './methods/ensureAndLockId';
import {ensureAndLockBeforeRendering} from './methods/ensureAndLockBeforeRendering';
import {doRenderSSR} from './methods/doRenderSSR';
import {renderBody} from './methods/renderBody';
import {renderPageContributions} from './methods/renderPageContributions';
import {renderSSRIntoContainer} from './methods/renderSSRIntoContainer';
import {renderTargetContainer} from './methods/renderTargetContainer';
import {setHasRegions} from './methods/setHasRegions';
import {setId} from './methods/setId';
import {setIsPage} from './methods/setIsPage';
import {setJsxPath} from './methods/setJsxPath';
import {setProps} from './methods/setProps';
import {uniqueId} from './methods/uniqueId';


const isArray = Array.isArray;


const BASE_PATHS = {
    part: "parts",
    page: "pages",
    layout: "layouts",
};


/** Mandatory constructor entry, one of two options (pseudo-overloaded function):
 * @param component {Object} If entry is an object: the portal.getComponent() object of the Enonic
 *      XP component (currently page or part) that the react component belongs to. XP and react components are found
 *      in the same folder (and the component object is used to extrapolate the resource path - jsxPath).
 *
 * @param jsxPath {String} If entry is a string: path to react component entry,
 *     relative to the folder where the transpiled (JS) react components are found - assets/react4xp. Overview of available entry
 *     paths is built to: build/resources/main/react4xp/entries.json.
 */
export function constructor<
	Props extends {
		react4xpId? :React4xpNamespace.Id
	} = {}
>(entry :React4xpNamespace.Entry) {
	//log.debug('React4xp.constructor() entry:%s', toStr(entry));

	const obj :React4xpNamespace.Class<Props> = {
		// Public fields/properties
		component: null,
		hasRegions: 0,        // boolean using 0 for false and 1 for true, for the sake of more compact client-side .render and .hydrate calls.
		isPage: 0,            // boolean using 0 for false and 1 for true, for the sake of more compact client-side .render and .hydrate calls.
		jsxPath: null,
		assetPath: null,
		props: null,
		react4xpId: null,
		react4xpIdIsLocked: false,

		// Public methods
		checkIdLock,
		ensureAndLockId,
		ensureAndLockBeforeRendering,
		doRenderSSR,
		renderBody,
		renderPageContributions,
		renderSSRIntoContainer,
		renderTargetContainer,
		setHasRegions,
		setId,
		setIsPage,
		setJsxPath,
		setProps,
		uniqueId
	};

	if (isString(entry)) {
		// Use jsxPath, regular flow
		obj.jsxPath = entry.trim();

		//obj.component = getComponent();

		if (obj.jsxPath === "") {
			throw new Error(`Can't initialize React4xp component with initParam = ${JSON.stringify(entry)}. XP component object or jsxPath string only, please.`);
		}

	} else if (!entry || (isObject(entry) && !isArray(entry))) {
		const comp = getComponent();
		if (comp) {
			// Component. Use entry in component flow. Derive jsxPath and default ID from local part/layout folder, same name.
			obj.component = entry || comp;

		} else {
			const cont = getContent();
			if (cont && cont.page) {
				// TODO: In the long run, it would be better with a more reliable test than !component for whether this is a top-level entry call specifically from a page controller.
				//       Especially since page-view entries that are called from the controller by jsxPath instead of by component, will be unable to detect if its a page.
				//       Make a Content.getPage() call from a bean? And if it fails, this fallback should be skipped since this wasn't called from a page controller.
				// Page. Use content.page in page flow. Derive jsxPath and default ID from local page folder, same name.
				obj.isPage = 1;
				obj.component = cont.page;

			} else {
				// Missing content.page.descriptor as well as component and jsxPath
				throw new Error("React4xp seems to be called from an invalid context. Looks like you tried to derive jsxPath from a non-jsxPath 'entry' parameter, using either a falsy or component object (portal.getComponent() called from a component controller, i.e. part, layout). But both in-constructor calls portal.getComponent() and portal.getContent() yielded invalid results: no component data and no content.page.  |  entry=" + JSON.stringify(entry) + "  |  portal.getComponent=" + JSON.stringify(comp) + "  |  portal.getContent=" + JSON.stringify(cont));
			}
		}


		const buildingBlockData = {
			descriptor: obj.component.descriptor || getDescriptorFromTemplate(obj.component.type, obj.component.template),
			type: BASE_PATHS[obj.component.type],
			path: obj.component.path
		};
		Object.keys(buildingBlockData).forEach(attribute => {
			if (!buildingBlockData[attribute]) {
				throw new Error(makeErrorMessage(attribute, obj.component));
			}
		});

		const compName = buildingBlockData.descriptor.split(":")[1];
		obj.jsxPath = `site/${buildingBlockData.type}/${compName}/${compName}`;
		obj.react4xpId = `${buildingBlockData.type}_${compName}_${buildingBlockData.path}`.replace(/\//g, "_");


		// TODO: Move to later in the flow. Where are regions relevant and obj.component guaranteed?
		// ------------------------------------------------------------------------------------------
		if (obj.component.regions && Object.keys(obj.component.regions).length) {
			obj.hasRegions = 1;
		} else if (obj.isPage) {
			log.debug("React4xp appears to be asked to render a page. No regions are found.  |  entry=" + JSON.stringify(entry) + "  |  portal.getComponent=" + JSON.stringify(getComponent()) + "  |  portal.getContent=" + JSON.stringify(getContent));
		}
		// ------------------------------------------------------------------------------------------


	} else {
		// Missing entry
		throw new Error("React4xp got an invalid 'entry' reference. Either use falsy, a jsxPath string, or a component object (portal.getComponent() called from a component controller, i.e. part, layout). entry=" + JSON.stringify(entry));
	}

	obj.assetPath = jsxToAssetPath(obj.jsxPath);
	//log.debug('React4xp.constructor() assetPath:%s', obj.assetPath);

	return obj;
} // constructor
