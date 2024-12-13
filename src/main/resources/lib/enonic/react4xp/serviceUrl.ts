import type { ServiceUrlParams } from '@enonic-types/lib-portal'; // Might be deprecated in XP8.

import { getUrlType } from '/lib/enonic/react4xp/React4xp/utils/getUrlType';


interface ServiceUrlBuilder {
	setApplication(value: string): void;
	setParams(value: object): void;
	setPath(value: string): void;
	setType(value: string): void;
	setServiceName(value: string): void;
	createUrl(): string;
}


export interface R4xServiceUrlParams extends ServiceUrlParams {
	path?: string;
}


export function serviceUrl({
	application = app.name,
	params,
	path = '/',
	service,
	type = getUrlType()
}: R4xServiceUrlParams): string {
	const bean: ServiceUrlBuilder = __.newBean('com.enonic.lib.react4xp.url.ServiceUrlBuilder');

	bean.setApplication(application);
	bean.setParams(__.toScriptValue(params ?? {}));
	bean.setPath(path);
	bean.setType(type);
	bean.setServiceName(service);

	return bean.createUrl();
}
