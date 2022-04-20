//import type {React4xp as React4xpNamespace} from '../../..';


import {setup as setupSSRJava} from './ssr'
import {constructor} from './React4xp/constructor';
import {buildFromParams} from './React4xp/static/buildFromParams';
import {render} from './React4xp/static/render';
import {templateDescriptorCache} from './React4xp/templateDescriptorCache';
import {getClientUrl} from '/lib/enonic/react4xp/asset/client/getClientUrl';
import {getExecutorUrl} from '/lib/enonic/react4xp/asset/executor/getExecutorUrl';
import {getComponentChunkUrls} from '/lib/enonic/react4xp/dependencies/getComponentChunkUrls';

setupSSRJava();


export const React4xp = constructor;
// Adding React4xp.prototype.someName just adds methods, not static methods
//@ts-ignore
React4xp._buildFromParams = buildFromParams;
//@ts-ignore
React4xp._clearCache = () => {
	templateDescriptorCache.clear();
};
//@ts-ignore
React4xp.getAssetUrls = getComponentChunkUrls;
//@ts-ignore
React4xp.getClientUrl = getClientUrl;
//@ts-ignore
React4xp.getExecutorUrl = getExecutorUrl
//@ts-ignore
React4xp.render = render;
