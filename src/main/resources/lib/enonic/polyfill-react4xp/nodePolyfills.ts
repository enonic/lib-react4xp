import type {ContextWithTimers} from './timers';

import {TextEncoder} from '@sinonjs/text-encoding';
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
//@ts-expect-error TS2695: Left side of comma operator is unused and has no side effects.
})((1, eval)('this') as Partial<ContextWithTimers>);
