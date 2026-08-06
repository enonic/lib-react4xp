// Spec-compliant atob/btoa polyfills from core-js. Side-effect imports — they install
// globalThis.atob / globalThis.btoa if not already present.
import 'core-js/modules/web.atob.js';
import 'core-js/modules/web.btoa.js';

(function (context) {
	//──────────────────────────────────────────────────────────────────────────
	// Timers: When doing SSR it makes no sense to do anything asynchronously.
	// Inert shims — callbacks are never invoked.
	//──────────────────────────────────────────────────────────────────────────
	context['setTimeout'] ??= () => 0;
	context['setInterval'] ??= () => 0;
	context['clearTimeout'] ??= () => undefined;
	context['clearInterval'] ??= () => undefined;
	context['queueMicrotask'] ??= () => undefined;

	//──────────────────────────────────────────────────────────────────────────
	// process: GraalJS doesn't provide a `process` global. Many libraries reach
	// for `process.env.NODE_ENV` at module-load time, so a minimal shim avoids
	// ReferenceError.
	//──────────────────────────────────────────────────────────────────────────
	context['process'] ??= {env: {}};
//@ts-expect-error TS2695: Left side of comma operator is unused and has no side effects.
})((1, eval)('this') as Record<string, unknown>);
