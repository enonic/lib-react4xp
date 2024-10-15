import type {
	ByteSource,
	// ResourceKey
  } from '@enonic-types/lib-io';
import type {App, DoubleUnderscore, Log} from './global.d';

import {mock} from 'bun:test';
import {Resource} from './mocks/Resource';

declare namespace globalThis {
	let app: App
	let log: Log
	let __: DoubleUnderscore
	let _devMode: boolean
	let _resources: Record<string, {
		bytes?: string
		exists?: boolean
		// etag?: string
		// mimeType?: string
	}>
}

const isObject = (value: unknown): value is Record<string, unknown> => {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const statsComponent = {
	outputPath: "/Users/fullname/code/github/enonic/starter-react4xp/build/resources/main/r4xAssets",
	assetsByChunkName: {
		"site/parts/software-show/software-show": [
      		"site/parts/software-show/software-show.d6607ab772af6315d3c7.js"
    	],
		// "site/pages/default/default": [
		// 	"site/pages/default/default.js",
		// 	// "site/pages/default/default.css" // Not immuteable according to logic in getImmutableDependencies
		// ],
		// runtime: ["runtime.js"],
		// vendors: ["vendors.js"],
		// templates: ["templates.js"],
	},
	// assets: [
	// 	{
	// 		type: "assets by status",
	// 		cached: true,
	// 		filteredChildren: 7,
	// 		size: 245114,
	// 	},
	// ],
	entrypoints: {
		"site/parts/software-show/software-show": {
			"name": "site/parts/software-show/software-show",
			"chunks": [
				121,
				328,
				309
			],
			"assets": [
				{
				"name": "runtime.013d7beda9eb41f08f42.js"
				},
				{
				"name": "react4xp.a137d3d05ff1b7d18928.js"
				},
				{
				"name": "site/parts/software-show/software-show.d6607ab772af6315d3c7.js"
				}
			],
			"filteredAssets": 0,
			"assetsSize": null,
			"auxiliaryAssets": [
				{
				"name": "react4xp.a137d3d05ff1b7d18928.js.map"
				},
				{
				"name": "runtime.013d7beda9eb41f08f42.js.map"
				},
				{
				"name": "site/parts/software-show/software-show.d6607ab772af6315d3c7.js.map"
				}
			],
			"filteredAuxiliaryAssets": 0,
			"auxiliaryAssetsSize": null,
			"children": {},
			"childAssets": {}
		},
		// "site/pages/default/default": {
		// 	name: "site/pages/default/default",
		// 	chunks: [
		// 		"runtime",
		// 		"vendors",
		// 		"templates",
		// 		"site/pages/default/default",
		// 	],
		// 	assets: [
		// 		{
		// 			name: "runtime.js",
		// 		},
		// 		{
		// 			name: "vendors.js",
		// 		},
		// 		{
		// 			name: "templates.js",
		// 		},
		// 		// {
		// 		// 	name: "site/pages/default/default.css",
		// 		// },
		// 		{
		// 			name: "site/pages/default/default.js",
		// 		},
		// 	],
		// 	filteredAssets: 0,
		// 	assetsSize: null,
		// 	auxiliaryAssets: [],
		// 	filteredAuxiliaryAssets: 0,
		// 	auxiliaryAssetsSize: 0,
		// 	children: {},
		// 	childAssets: {},
		// },
	},
	// errors: [],
	// errorsCount: 0,
	// warnings: [],
	// warningsCount: 0,
};

globalThis._devMode = false;

globalThis._resources = {
	'/r4xAssets/stats.components.json': {
		bytes: JSON.stringify(statsComponent),
		exists: true,
	}
};

globalThis.app = {
	name: 'com.example.myproject',
	config: {},
	version: '1.0.0',
};

globalThis.log = {
	info: console.log,
	warning: console.warn,
	error: console.error,
	// debug: console.debug,
	debug: () => {},
}

// @ts-ignore
globalThis.__ = {
	// @ts-ignore
	newBean: (bean: string) => {
		if (bean === 'com.enonic.lib.react4xp.AppHelper') {
			return {
				isDevMode: () => globalThis._devMode,
				getXpHome: () => '/tmp/xphome'
			}
		}
		throw new Error(`Unmocked bean:${bean}!`);
	},
	nullOrValue: (v: any) => {
		console.error(`nullOrValue value:${JSON.stringify(v, null, 4)}`);
		return v;
	},
	toNativeObject: <T>(v: T): T => {
		console.error(`toNativeObject value:${JSON.stringify(v, null, 4)}`);
		if (isObject(v)) {
			return v as T;
		}
		/* coverage ignore next */
		throw new Error(`toNativeObject: Unmocked value:${JSON.stringify(v, null, 4)}!`);
	},
	toScriptValue: (v: any) => {
		console.error(`toScriptValue value:${JSON.stringify(v, null, 4)}`);
		return v;
	},
}

try {
	await mock.module('/lib/xp/io', () => ({
		getResource: (key: string) => {
			const resource = globalThis._resources[key];
			if (!resource) {
			throw new Error(`getResource: Unmocked key:${JSON.stringify(key, null, 4)}!`);
			}

			if (!resource.exists) {
				return new Resource({
					bytes: '',
					exists: false,
					key: key.toString(),
					size: 0,
					timestamp: 0,
				});
			}

			return new Resource({
				bytes: resource.bytes || '',
				exists: true,
				key: key.toString(),
				size: (resource.bytes || '').length,
				timestamp: 2,
			});
		},
		readText: (stream: ByteSource) => {
			return stream as unknown as string;
		}
	}));
} catch (error) {
	console.error('Error when mocking /lib/xp/io:', error);
}
