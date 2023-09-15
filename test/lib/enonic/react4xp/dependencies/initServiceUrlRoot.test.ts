import type { assetUrl } from '@enonic-types/lib-portal';

import {
	describe,
	expect,
	jest,
	test as it
} from '@jest/globals';
import Log from '@enonic/mock-xp/dist/Log';


// @ts-ignore TS2339: Property 'log' does not exist on type 'typeof globalThis'.
global.app = {
	name: 'com.enonic.app.react4xp'
}

// @ts-ignore TS2339: Property 'log' does not exist on type 'typeof globalThis'.
global.log = Log.createLogger({
	// loglevel: 'debug'
	loglevel: 'silent'
});

function mockLibPortal(url) {
	jest.mock('/lib/xp/portal', () => ({
		__esModule: true,
		assetUrl: jest.fn<typeof assetUrl>(({
			path: _path,
			type = 'server',
		}) => {
			if (type === 'server') {
				return url;
			}
			return `http://localhost:8080${url}`;
		}),
	}), { virtual: true });
}


describe('webappUrl', () => {
	it('handles mode: inline', () => {
		jest.resetModules();
		mockLibPortal('/admin/site/inline/default/draft/_/asset/com.enonic.app.react4xp:0000018a9816e580');
		import('/lib/enonic/react4xp/dependencies/initServiceUrlRoot').then((moduleName) => {
			expect(moduleName.initServiceUrlRoot()).toBe('/admin/site/inline/default/draft/_/service/com.enonic.app.react4xp/');
		});
	});
	it('handles mode: inline using type: absolute', () => {
		jest.resetModules();
		mockLibPortal('/admin/site/inline/default/draft/_/asset/com.enonic.app.react4xp:0000018a9816e580');
		import('/lib/enonic/react4xp/dependencies/initServiceUrlRoot').then((moduleName) => {
			expect(moduleName.initServiceUrlRoot('', {
				type: 'absolute'
			})).toBe('http://localhost:8080/admin/site/inline/default/draft/_/service/com.enonic.app.react4xp/');
		});
	});
	it('handles mode: edit', () => {
		jest.resetModules();
		mockLibPortal('/admin/site/edit/default/draft/_/asset/com.enonic.app.react4xp:0000018a9816e580');
		import('/lib/enonic/react4xp/dependencies/initServiceUrlRoot').then((moduleName) => {
			expect(moduleName.initServiceUrlRoot()).toBe('/admin/site/preview/default/draft/_/service/com.enonic.app.react4xp/');
		});
	});
	it('handles mode: edit using type: absolute', () => {
		jest.resetModules();
		mockLibPortal('/admin/site/edit/default/draft/_/asset/com.enonic.app.react4xp:0000018a9816e580');
		import('/lib/enonic/react4xp/dependencies/initServiceUrlRoot').then((moduleName) => {
			expect(moduleName.initServiceUrlRoot('', {
				type: 'absolute'
			})).toBe('http://localhost:8080/admin/site/preview/default/draft/_/service/com.enonic.app.react4xp/');
		});
	});
	it('handles mode: preview', () => {
		jest.resetModules();
		mockLibPortal('/admin/site/preview/default/draft/_/asset/com.enonic.app.react4xp:0000018a9816e580');
		import('/lib/enonic/react4xp/dependencies/initServiceUrlRoot').then((moduleName) => {
			expect(moduleName.initServiceUrlRoot()).toBe('/admin/site/preview/default/draft/_/service/com.enonic.app.react4xp/');
		});
	});
	it('handles mode: preview using type: absolute', () => {
		jest.resetModules();
		mockLibPortal('/admin/site/preview/default/draft/_/asset/com.enonic.app.react4xp:0000018a9816e580');
		import('/lib/enonic/react4xp/dependencies/initServiceUrlRoot').then((moduleName) => {
			expect(moduleName.initServiceUrlRoot('', {
				type: 'absolute'
			})).toBe('http://localhost:8080/admin/site/preview/default/draft/_/service/com.enonic.app.react4xp/');
		});
	});
	it('handles mode: live', () => {
		jest.resetModules();
		mockLibPortal('/site/default/master/_/asset/com.enonic.app.react4xp:0000018a9816e580');
		import('/lib/enonic/react4xp/dependencies/initServiceUrlRoot').then((moduleName) => {
			expect(moduleName.initServiceUrlRoot()).toBe('/site/default/master/_/service/com.enonic.app.react4xp/');
		});
	});
	it('handles mode: live using type: absolute', () => {
		jest.resetModules();
		mockLibPortal('/site/default/master/_/asset/com.enonic.app.react4xp:0000018a9816e580');
		import('/lib/enonic/react4xp/dependencies/initServiceUrlRoot').then((moduleName) => {
			expect(moduleName.initServiceUrlRoot('', {
				type: 'absolute'
			})).toBe('http://localhost:8080/site/default/master/_/service/com.enonic.app.react4xp/');
		});
	});
});
