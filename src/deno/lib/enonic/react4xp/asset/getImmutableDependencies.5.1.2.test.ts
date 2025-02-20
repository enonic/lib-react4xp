import type {App, DoubleUnderscore, Log} from '../../../../global.d.ts';
import {assertEquals} from "jsr:@std/assert";
import '../../../../mocks/globals.ts';


declare namespace globalThis {
	let app: App
	let log: Log
	let __: DoubleUnderscore
	let _devMode: boolean
	let _resources: Record<string, {
		bytes?: string
		exists?: boolean
	}>
}

const statsComponent = {
	assetsByChunkName: {
		"site/parts/example/example": [
			"site/parts/example/example.db34cf922.css",
			"site/parts/example/example.js",
		],
		"site/parts/software-show/software-show": [
			"site/parts/software-show/software-show.d6607ab772af6315d3c7.js",
		],
		"site/pages/default/default": [
			"site/pages/default/default.js",
		],
	},
	assets: [
		{
			info: {
				sourceFilename:
					"src/main/resources/site/pages/default/font/opensans-regular.woff",
				immutable: true,
				contenthash: "7357db2d782c71df6079",
			},
			name: "7357db2d782c71df6079.woff",
		},
		{
			info: {
				immutable: true,
				contenthash: "db34cf922",
			},
			name: "site/parts/example/example.db34cf922.css",
		},
		{
			info: {
				immutable: true,
				contenthash: "d6607ab772af6315d3c7",
			},
			name: "site/parts/software-show/software-show.d6607ab772af6315d3c7.js",
		},
	],
	entrypoints: {
		"site/parts/example/example": {
			name: "site/parts/example/example",
			chunks: ["runtime", "vendors", "site/parts/example/example"],
			assets: [
				{
					name: "runtime.js",
				},
				{
					name: "vendors.js",
				},
				{
					name: "site/parts/example/example.db34cf922.css",
				},
				{
					name: "site/parts/example/example.js",
				},
			],
			auxiliaryAssets: [],
		},
		"site/parts/software-show/software-show": {
			assets: [
				{
					name: "runtime.013d7beda9eb41f08f42.js",
				},
				{
					name: "react4xp.a137d3d05ff1b7d18928.js",
				},
				{
					name: "site/parts/software-show/software-show.d6607ab772af6315d3c7.js",
				},
			],
			auxiliaryAssets: [
				{
					name: "react4xp.a137d3d05ff1b7d18928.js.map",
				},
				{
					name: "runtime.013d7beda9eb41f08f42.js.map",
				},
				{
					name: "site/parts/software-show/software-show.d6607ab772af6315d3c7.js.map",
				},
			],
		},
		"site/pages/default/default": {
			assets: [
				{
					name: "runtime.js",
				},
				{
					name: "vendors.js",
				},
				{
					name: "templates.js",
				},
				{
					name: "site/pages/default/default.js",
				},
			],
			auxiliaryAssets: [
				{
					name: "7357db2d782c71df6079.woff",
				},
				{
					name: "80f2f852bfcc8b6f0e46.eot",
				},
				{
					name: "ba13a65fef439e754a6b.svg",
				},
				{
					name: "ce840efee55292315393.ttf",
				},
			],
		},
	},
};

globalThis._resources = {
	'/r4xAssets/stats.components.json': {
		bytes: JSON.stringify(statsComponent),
		exists: true,
	}
}

Deno.test("returns dependencies which has contenthash in filename", () => {
	import('../../../../../main/resources/lib/enonic/react4xp/asset/getImmutableDependencies.ts').then(({getImmutableDependencies}) => {
		assertEquals(getImmutableDependencies([]), [
			'site/parts/example/example.db34cf922.css',
			'site/parts/software-show/software-show.d6607ab772af6315d3c7.js',
			'7357db2d782c71df6079.woff',
		]);

		assertEquals(getImmutableDependencies([
			'site/parts/software-show/software-show.d6607ab772af6315d3c7.js'
		]), [
			'site/parts/example/example.db34cf922.css',
			'7357db2d782c71df6079.woff',
		]);

		assertEquals(getImmutableDependencies([
			'site/parts/software-show/software-show'
		]), [
			'site/parts/example/example.db34cf922.css',
			'site/parts/software-show/software-show.d6607ab772af6315d3c7.js',
			'7357db2d782c71df6079.woff',
		]);
	});
});
