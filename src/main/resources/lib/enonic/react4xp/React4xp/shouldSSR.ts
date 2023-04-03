import type { Request } from '/types/Request.d';
import type { AppConfig } from '/types/Application.d';
import { isSet } from '@enonic/js-utils/value/isSet';
// import { toStr } from '@enonic/js-utils/value/toStr';


export default function shouldSSR({
	request,
	ssr
}: {
	request?: Request
	ssr?: boolean
}) {
	// log.debug('app.config:%s', toStr(app.config));
	// Client-side rendering interferes with Content Studio in edit mode,
	// thus SSR is enforced when request is missing, or mode is 'edit'
	return !request ? true
		: !request.mode ? true
		: request.mode === 'edit' ? true
		: isSet(ssr) ? ssr
		: (app.config as AppConfig)['react4xp.ssr'] !== 'false'; // default is true
}
