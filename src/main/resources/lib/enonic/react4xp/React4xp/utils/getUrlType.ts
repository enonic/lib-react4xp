import type {AppConfig} from '/lib/enonic/react4xp/types/Application';
import type {UrlType} from '/lib/enonic/react4xp/types/React4xp';


import {isSet} from '@enonic/js-utils/value/isSet';


export function getUrlType(urlType?: UrlType) {
	// log.debug("app.config['react4xp.urlType']: %s", (app.config as AppConfig)['react4xp.urlType']);
	const finalUrlType = (
		isSet(urlType)
		&& (
			urlType === 'server'
			|| urlType === 'absolute'
		)
	)
		? urlType
		: (app.config as AppConfig)['react4xp.urlType'] === 'absolute'
			? 'absolute'
			: 'server'; // default is server
	// log.debug('getUrlType(%s) --> %s', urlType ?? '', finalUrlType);
	return finalUrlType;
}
