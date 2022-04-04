//import type {React4xp as React4xpNamespace} from '../../..';


import {setup as setupSSRJava} from './ssr'
import {constructor} from './React4xp/constructor';
import {buildFromParams} from './React4xp/static/buildFromParams';
import {render} from './React4xp/static/render';
import {templateDescriptorCache} from './React4xp/templateDescriptorCache';
import {dynamicScript} from '/lib/enonic/react4xp/asset/dynamic';
import {getClientUrls} from '/lib/enonic/react4xp/asset/client/getClientUrls';
import {getComponentChunkUrls} from '/lib/enonic/react4xp/dependencies/getComponentChunkUrls';

setupSSRJava();


/*export const React4xp :React4xpNamespace.Class = (function () { // iife, new React4xp doesn't work!!!
    return {
		constructor,
		// Static methods
		_buildFromParams: buildFromParams,
		_clearCache: () => {
			templateDescriptorCache.clear();
		},
		getClientUrls,
		getComponentChunkUrls,
		dynamicScript,
		render
	};
})();*/

export const React4xp = constructor;
// Adding React4xp.prototype.someName just adds methods, not static methods
//@ts-ignore
React4xp._buildFromParams = buildFromParams;
//@ts-ignore
React4xp._clearCache = () => {
	templateDescriptorCache.clear();
};
//@ts-ignore
React4xp.dynamicScript = dynamicScript;
//@ts-ignore
React4xp.getClientUrls = getClientUrls;
//@ts-ignore
React4xp.getComponentChunkUrls = getComponentChunkUrls;
//@ts-ignore
React4xp.render = render;
