import type {UrlType} from '/lib/enonic/react4xp/types/React4xp';
import {apiUrl} from '/lib/xp/portal';
import {getUrlType} from '/lib/enonic/react4xp/React4xp/utils/getUrlType';


export interface R4xAssetUrlParams {
	params?: Record<string, string | string[]>;
	path?: string | string[];
	type?: UrlType;
}


export function assetUrl({
	params,
	path = '/',
	type = getUrlType()
}: R4xAssetUrlParams = {}): string {
	return apiUrl({
		api: 'react4xp',
		params,
		path,
		type
	});
}
