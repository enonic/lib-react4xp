import type {AssetUrlParams} from '@enonic-types/lib-portal'; // Might be deprecated in XP8.
import {getUrlType} from '/lib/enonic/react4xp/React4xp/utils/getUrlType';
import {serviceUrl} from '/lib/enonic/react4xp/serviceUrl';


export interface R4xAssetUrlParams extends AssetUrlParams {
	service?: string;
}


export function assetUrl({
	application = app.name,
	params,
	path = '/',
	service = 'asset',
	type = getUrlType()
}: R4xAssetUrlParams): string {
	return serviceUrl({
		application,
		params,
		path,
		service,
		type
	});
}
