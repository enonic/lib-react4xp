import type { AppConfig } from '../../types/Application';
import { isSet } from '@enonic/js-utils/value/isSet';


export default function getHydrateConfig(hydrate?: boolean) {
	return isSet(hydrate)
		? hydrate
		: (app.config as AppConfig)['react4xp.hydrate'] !== 'false'; // default is true
}
