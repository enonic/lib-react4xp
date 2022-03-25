import type {
	Request,
	Response
} from '../../../../..';


//import {toStr} from '@enonic/js-utils/value/toStr';
import {h64} from 'xxhashjs';
import {getServiceRoot} from '/lib/enonic/react4xp/serviceRoots';


const SNIPPETS = {};


export function cacheDynamicAsset(jsString :string) {
	//log.debug('cacheDynamicAsset() jsString:%s', toStr(jsString));
	const hash = h64();
	hash.update(jsString);
	const digest = hash.digest();
	const hex = digest.toString(16);
	//log.debug('cacheDynamicAsset() hex:%s', toStr(hex));
	SNIPPETS[hex] = jsString;
	return hex;
}


export function dynamicScript(jsString :string) {
	const key = cacheDynamicAsset(jsString);
	return `<script src="${getServiceRoot('react4xpDynamic')}dynamic.${key}.js"></script>`;
}


export function handleDynamicAssetRequest(request: Request) :Response {
	//log.debug('handleDynamicAssetRequest() request:%s', toStr(request));

	const {
		path
	} = request;
	//log.debug('handleDynamicAssetRequest() path:%s', toStr(path));

	const filename = path.split('/').pop();
	//log.debug('handleDynamicAssetRequest() filename:%s', toStr(filename));

	const key = filename.replace(/^dynamic\./, '').replace(/\.js$/, '');
	//log.debug('handleDynamicAssetRequest() key:%s', toStr(key));

	const body = SNIPPETS[key];
	if (!body) {
		return {
			status: 404
		};
	}
	return {
		body,
		contentType: 'application/javascript; charset=utf-8',
		headers: {
			'Cache-Control': 'public, max-age=31536000, immutable'
		}
	};
}
