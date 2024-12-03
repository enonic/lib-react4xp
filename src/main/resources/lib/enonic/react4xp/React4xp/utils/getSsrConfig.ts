import type { AppConfig } from '@enonic-types/lib-react4xp';
import { isSet } from '@enonic/js-utils/value/isSet';


export default function getSsrConfig(ssr?: boolean) {
	return isSet(ssr)
		? ssr
		: (app.config as AppConfig)['react4xp.ssr'] !== 'false'; // default is true
}
