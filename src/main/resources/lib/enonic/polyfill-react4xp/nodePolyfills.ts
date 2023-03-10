import type {ContextWithTimers} from './timers';

import {TextEncoder} from 'text-encoding';
import {polyfillTimers} from './timers';

(function (context) {
	//──────────────────────────────────────────────────────────────────────────
	// Timers: When doing SSR it makes no sense to do anything asyncronously.
	//──────────────────────────────────────────────────────────────────────────
	polyfillTimers(context);

	//──────────────────────────────────────────────────────────────────────────
	// text-encoding
	//──────────────────────────────────────────────────────────────────────────
	if (typeof context['TextEncoder'] === 'undefined') {
		context['TextEncoder'] = TextEncoder;
	}
})((1, eval)('this') as Partial<ContextWithTimers>);
