import type {App, DoubleUnderscore, Log} from '../../../../global.d.ts';
import { assertEquals } from "jsr:@std/assert";
import '../../../../mocks/globals.ts';

declare namespace globalThis {
	let app: App
	let log: Log
	let __: DoubleUnderscore
	let _assetUrl: string
}

function mockAssetUrl(mode: string) {
	return `/admin/site/${mode}/default/draft/_/asset/com.enonic.app.react4xp:0000018a9816e580`;
}

await Deno.test("handles mode: inline", async () => {
	globalThis._assetUrl = mockAssetUrl('inline');
	const {initServiceUrlRoot} = await import('../../../../../main/resources/lib/enonic/react4xp/dependencies/initServiceUrlRoot.ts');
	assertEquals(initServiceUrlRoot(), '/admin/site/inline/default/draft/_/service/com.enonic.app.react4xp/');
});

await Deno.test("handles mode: inline using type: absolute", async () => {
	globalThis._assetUrl = mockAssetUrl('inline');
	const {initServiceUrlRoot} = await import('../../../../../main/resources/lib/enonic/react4xp/dependencies/initServiceUrlRoot.ts');
	assertEquals(initServiceUrlRoot({
		urlType: 'absolute'
	}), 'http://localhost:8080/admin/site/inline/default/draft/_/service/com.enonic.app.react4xp/');
});

await Deno.test("handles mode: edit", async () => {
	globalThis._assetUrl = mockAssetUrl('edit');
	const {initServiceUrlRoot} = await import('../../../../../main/resources/lib/enonic/react4xp/dependencies/initServiceUrlRoot.ts');
	assertEquals(initServiceUrlRoot(), '/admin/site/preview/default/draft/_/service/com.enonic.app.react4xp/');
});

await Deno.test("handles mode: edit type: absolute", async () => {
	globalThis._assetUrl = mockAssetUrl('edit');
	const {initServiceUrlRoot} = await import('../../../../../main/resources/lib/enonic/react4xp/dependencies/initServiceUrlRoot.ts');
	assertEquals(initServiceUrlRoot({
		urlType: 'absolute'
	}), 'http://localhost:8080/admin/site/preview/default/draft/_/service/com.enonic.app.react4xp/');
});

await Deno.test("handles mode: preview", async () => {
	globalThis._assetUrl = mockAssetUrl('preview');
	import('../../../../../main/resources/lib/enonic/react4xp/dependencies/initServiceUrlRoot.ts').then(({initServiceUrlRoot}) => {
		assertEquals(initServiceUrlRoot(), '/admin/site/preview/default/draft/_/service/com.enonic.app.react4xp/');
	});
});

await Deno.test("handles mode: preview type: absolute", async () => {
	globalThis._assetUrl = mockAssetUrl('preview');
	const {initServiceUrlRoot} = await import('../../../../../main/resources/lib/enonic/react4xp/dependencies/initServiceUrlRoot.ts');
	assertEquals(initServiceUrlRoot({
		urlType: 'absolute'
	}), 'http://localhost:8080/admin/site/preview/default/draft/_/service/com.enonic.app.react4xp/');
});

await Deno.test("handles mode: live", async () => {
	globalThis._assetUrl = '/site/default/master/_/asset/com.enonic.app.react4xp:0000018a9816e580';
	const {initServiceUrlRoot} = await import('../../../../../main/resources/lib/enonic/react4xp/dependencies/initServiceUrlRoot.ts');
	assertEquals(initServiceUrlRoot(), '/site/default/master/_/service/com.enonic.app.react4xp/');
});

await Deno.test("handles mode: live type: absolute", async () => {
	globalThis._assetUrl = '/site/default/master/_/asset/com.enonic.app.react4xp:0000018a9816e580';
	const {initServiceUrlRoot} = await import('../../../../../main/resources/lib/enonic/react4xp/dependencies/initServiceUrlRoot.ts');
	assertEquals(initServiceUrlRoot({
		urlType: 'absolute'
	}), 'http://localhost:8080/site/default/master/_/service/com.enonic.app.react4xp/');
});
