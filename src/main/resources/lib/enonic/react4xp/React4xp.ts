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


/*export const React4xp :React4xpNamespace.Class = (function () { // iife, seems new React4xp doesn't work!!!
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
React4xp.prototype._buildFromParams = buildFromParams;
React4xp.prototype._clearCache = () => {
	templateDescriptorCache.clear();
};
React4xp.prototype.dynamicScript = dynamicScript;
React4xp.prototype.getClientUrls = getClientUrls;
React4xp.prototype.getComponentChunkUrls = getComponentChunkUrls;
React4xp.prototype.render = render;
