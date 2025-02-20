import type {ContextWithTimers} from './timers';
import {polyfillTimers} from './timers';

// @ts-ignore Could not find a declaration file for module '@sinonjs/text-encoding'
import {TextEncoder} from '@sinonjs/text-encoding';

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
