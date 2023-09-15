import type { AppConfig } from '/types/Application.d';
import { isSet } from '@enonic/js-utils/value/isSet';


export function getUrlType(urlType?: 'server' | 'absolute') {
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
