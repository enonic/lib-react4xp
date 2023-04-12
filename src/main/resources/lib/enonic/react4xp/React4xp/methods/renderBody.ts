import type { Request } from '../../../../..';
import type { React4xp } from '../../React4xp';
import type { AppConfig } from '/types/Application.d';
import { isSet } from '@enonic/js-utils/value/isSet';
import shouldSSR from '/lib/enonic/react4xp/React4xp/shouldSSR';


export function renderBody(this: React4xp, {
	body,
	request,
	ssr,
}: {
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
			// If the entry is a page or layout, and ssr is not explicitly
			// passed as a render option, it will set ssr to false.
			// Which means app.config['react4xp.ssr'] should not matter for
			// pages and layouts.
			// WARNING: If renderBody is called directly, that logic is skipped.
			isSet(ssr)
				? !ssr
				: (app.config as AppConfig)['react4xp.ssr'] === 'false'
		)
	) {
		return this.renderWarningPlaceholder();
	}

	// At this point: either request.mode was something other
	// than edit and/or the entry wasn't a client-side component.
	// Which means one can still get SSR or clientSideRendering.
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
