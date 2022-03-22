import {setup as setupSSRJava} from './ssr'
import {constructor} from './React4xp/constructor';
import {buildFromParams} from './React4xp/static/buildFromParams';
import {render} from './React4xp/static/render';
import {templateDescriptorCache} from './React4xp/templateDescriptorCache';


setupSSRJava();


export const React4xp = constructor;

// Static methods
//@ts-ignore
React4xp._buildFromParams = buildFromParams;
//@ts-ignore
React4xp._clearCache = () => {
	templateDescriptorCache.clear();
}
//@ts-ignore
React4xp.render = render;
