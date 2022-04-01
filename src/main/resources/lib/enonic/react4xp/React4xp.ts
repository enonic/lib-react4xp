import type {React4xp as React4xpNamespace} from '../../..';


import {setup as setupSSRJava} from './ssr'
import {constructor} from './React4xp/constructor';
import {buildFromParams} from './React4xp/static/buildFromParams';
import {render} from './React4xp/static/render';
import {templateDescriptorCache} from './React4xp/templateDescriptorCache';
import {dynamicScript} from '/lib/enonic/react4xp/asset/dynamic';
import {getClientUrls} from '/lib/enonic/react4xp/asset/client/getClientUrls';
import {getComponentChunkUrls} from '/lib/enonic/react4xp/dependencies/getComponentChunkUrls';

setupSSRJava();


export const React4xp :React4xpNamespace.Class = (function () { // iife
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
})();
