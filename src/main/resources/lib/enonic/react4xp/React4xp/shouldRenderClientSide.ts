import type { Request } from '/types/Request.d';
import type { AppConfig } from '/types/Application.d';
import { isSet } from '@enonic/js-utils/value/isSet';
// import { toStr } from '@enonic/js-utils/value/toStr';


export default function shouldRenderClientSide({
	clientRender,
	request
}: {
	clientRender?: boolean
	request?: Request
}) {
	// log.debug(
	// 	'shouldRenderClientSide clientRender:%s request:%s app.config:%s',
	// 	clientRender, toStr(request), toStr(app.config)
	// );
	// Client-side rendering interferes with Content Studio in edit mode,
	// thus SSR is enforced when request is missing, or mode is 'edit'
	return !request ? false
		: !request.mode ? false
		: request.mode === 'edit' ? false
		: isSet(clientRender) ? clientRender
		: (app.config as AppConfig)['react4xp.clientRender'] === 'true';
}
