import type { Request } from '../../../../..';
import type { React4xp } from '../../React4xp';
import type { AppConfig } from '/types/Application.d';
import { isSet } from '@enonic/js-utils/value/isSet';
import shouldSSR from '/lib/enonic/react4xp/React4xp/shouldSSR';


export function renderBody(this: React4xp, {
	body,
	request,
	ssr,
} :{
	body?: string
	ssr?: boolean
	request?: Request
} = {}): string {
	// log.debug('renderBody ssr:%s jsxPath:%s', ssr, this.jsxPath);

	// Client-side components, may import assets which are not available
	// server-side. To avoid potential SSR errors just show placeholder:
	if (
		(
			!request
			|| !request.mode
			|| request.mode === 'edit'
		) && (
			isSet(ssr)
				? !ssr
				: (app.config as AppConfig)['react4xp.ssr'] === 'false'
		)
	) {
		return this.renderWarningPlaceholder();
	}

	return shouldSSR({
		request,
		ssr
	})
		? this.renderSSRIntoContainer({
			body,
			request
		})
		: this.renderTargetContainer({
			body
		});
} // renderBody
