import type {ContextWithTimers} from './timers';
import {polyfillTimers} from './timers';

// @ts-ignore Could not find a declaration file for module '@sinonjs/text-encoding'
import {TextEncoder} from '@sinonjs/text-encoding';

// Spec-compliant atob/btoa polyfills from core-js. Side-effect imports — they install
// globalThis.atob / globalThis.btoa if not already present.
import 'core-js/modules/web.atob.js';
import 'core-js/modules/web.btoa.js';

// Transitional MessageChannel shim: react-dom/server.browser constructs a
// MessageChannel at module-load time (unconditionally, before any render call) for
// its streaming scheduler. With this minimal polyfill, the module loads and
// renderToString — which doesn't touch the channel — works.
//
// LIMITATIONS: postMessage is intentionally a no-op. The streaming APIs
// (renderToReadableStream, prerender) WILL silently hang because the no-op timers
// can never deliver messages. For streaming, consumers must use
// react-dom/server.edge (which has no MessageChannel dependency).
//
// Remove this once @enonic/react4xp's webpack config aliases react-dom/server to
// react-dom/server.edge — see https://github.com/facebook/react/issues/31827
function MessagePortShim(this: { onmessage: ((ev: { data: unknown }) => void) | null; postMessage: (data: unknown) => void }) {
	this.onmessage = null;
	this.postMessage = function () { /* no-op: SSR has no async */ };
}

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

	//──────────────────────────────────────────────────────────────────────────
	// MessageChannel: see comment above MessagePortShim.
	//──────────────────────────────────────────────────────────────────────────
	if (typeof context['MessageChannel'] === 'undefined') {
		context['MessageChannel'] = function MessageChannel(this: { port1: object; port2: object }) {
			// @ts-expect-error TS2350: 'new' expression with non-constructor type.
			this.port1 = new MessagePortShim();
			// @ts-expect-error TS2350: 'new' expression with non-constructor type.
			this.port2 = new MessagePortShim();
		};
	}
//@ts-expect-error TS2695: Left side of comma operator is unused and has no side effects.
})((1, eval)('this') as Partial<ContextWithTimers>);
