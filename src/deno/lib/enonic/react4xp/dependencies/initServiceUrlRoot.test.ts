import type {App, DoubleUnderscore, Log} from '../../../../global.d.ts';
import { assertEquals } from "jsr:@std/assert";
import '../../../../mocks/globals.ts';

declare namespace globalThis {
	let app: App
	let log: Log
	let __: DoubleUnderscore
	// let _devMode: boolean
	let _assetUrl: string
	// let _resources: Record<string, {
	// 	bytes?: string
	// 	exists?: boolean
	// }>
}

await Deno.test("handles mode: inline", () => {
	globalThis._assetUrl = '/admin/site/inline/default/draft/_/asset/com.enonic.app.react4xp:0000018a9816e580';
	import('../../../../../main/resources/lib/enonic/react4xp/dependencies/initServiceUrlRoot.ts').then(({initServiceUrlRoot}) => {
		assertEquals(initServiceUrlRoot(), '/admin/site/inline/default/draft/_/service/com.enonic.app.react4xp/');
	});
});

await Deno.test("handles mode: inline using type: absolute", () => {
	globalThis._assetUrl = '/admin/site/inline/default/draft/_/asset/com.enonic.app.react4xp:0000018a9816e580';
	import('../../../../../main/resources/lib/enonic/react4xp/dependencies/initServiceUrlRoot.ts').then(({initServiceUrlRoot}) => {
		assertEquals(initServiceUrlRoot({
			urlType: 'absolute'
		}), 'http://localhost:8080/admin/site/inline/default/draft/_/service/com.enonic.app.react4xp/');
	});
});

await Deno.test("handles mode: edit", () => {
	globalThis._assetUrl = '/admin/site/edit/default/draft/_/asset/com.enonic.app.react4xp:0000018a9816e580';
	import('../../../../../main/resources/lib/enonic/react4xp/dependencies/initServiceUrlRoot.ts').then(({initServiceUrlRoot}) => {
		assertEquals(initServiceUrlRoot(), '/admin/site/preview/default/draft/_/service/com.enonic.app.react4xp/');
	});
});

await Deno.test("handles mode: edit type: absolute", () => {
	globalThis._assetUrl = '/admin/site/edit/default/draft/_/asset/com.enonic.app.react4xp:0000018a9816e580';
	import('../../../../../main/resources/lib/enonic/react4xp/dependencies/initServiceUrlRoot.ts').then(({initServiceUrlRoot}) => {
		assertEquals(initServiceUrlRoot({
			urlType: 'absolute'
		}), 'http://localhost:8080/admin/site/preview/default/draft/_/service/com.enonic.app.react4xp/');
	});
});

await Deno.test("handles mode: preview", () => {
	globalThis._assetUrl = '/admin/site/preview/default/draft/_/asset/com.enonic.app.react4xp:0000018a9816e580';
	import('../../../../../main/resources/lib/enonic/react4xp/dependencies/initServiceUrlRoot.ts').then(({initServiceUrlRoot}) => {
		assertEquals(initServiceUrlRoot(), '/admin/site/preview/default/draft/_/service/com.enonic.app.react4xp/');
	});
});

await Deno.test("handles mode: preview type: absolute", () => {
	globalThis._assetUrl = '/admin/site/preview/default/draft/_/asset/com.enonic.app.react4xp:0000018a9816e580';
	import('../../../../../main/resources/lib/enonic/react4xp/dependencies/initServiceUrlRoot.ts').then(({initServiceUrlRoot}) => {
		assertEquals(initServiceUrlRoot({
			urlType: 'absolute'
		}), 'http://localhost:8080/admin/site/preview/default/draft/_/service/com.enonic.app.react4xp/');
	});
});

await Deno.test("handles mode: live", () => {
	globalThis._assetUrl = '/site/default/master/_/asset/com.enonic.app.react4xp:0000018a9816e580';
	import('../../../../../main/resources/lib/enonic/react4xp/dependencies/initServiceUrlRoot.ts').then(({initServiceUrlRoot}) => {
		assertEquals(initServiceUrlRoot(), '/site/default/master/_/service/com.enonic.app.react4xp/');
	});
});

await Deno.test("handles mode: live type: absolute", () => {
	globalThis._assetUrl = '/site/default/master/_/asset/com.enonic.app.react4xp:0000018a9816e580';
	import('../../../../../main/resources/lib/enonic/react4xp/dependencies/initServiceUrlRoot.ts').then(({initServiceUrlRoot}) => {
		assertEquals(initServiceUrlRoot({
			urlType: 'absolute'
		}), 'http://localhost:8080/site/default/master/_/service/com.enonic.app.react4xp/');
	});
});
