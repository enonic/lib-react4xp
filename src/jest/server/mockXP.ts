// import type {
// 	Content,
// } from '@enonic-types/core';
import type {get as getContentByKeyType} from '@enonic-types/lib-content';
import type {
	SiteConfig,
	assetUrl,
	getContent as getCurrentContentType,
	getSiteConfig,
	imageUrl as imageUrlType,
	processHtml
} from '@enonic-types/lib-portal';
import {App, LibContent, LibPortal, Request, Server} from '@enonic/mock-xp';
import {CONTENT_TYPE_PORTAL_SITE} from '@enonic/mock-xp/dist/constants';
import {jest} from '@jest/globals';

import {
	LAYOUT_FRAGMENT_CONTENT_ID,
	LAYOUT_FRAGMENT_CONTENT,
	PART_FRAGMENT_CONTENT_ID,
	PART_FRAGMENT_CONTENT,
	PROCESSED_HTML,
	TEXT_FRAGMENT_CONTENT_ID,
	TEXT_FRAGMENT_CONTENT
} from './data';

type AssetUrl = typeof assetUrl;
type ProcessHtml = typeof processHtml;
type GetSiteConfig = typeof getSiteConfig;

const APP_KEY = 'com.example.myproject';
const PROJECT_NAME = 'myproject';
const SITE_NAME = 'mysite';


export const server = new Server({
	loglevel: 'warn'
}).createProject({
	projectName: PROJECT_NAME
}).setContext({
	projectName: PROJECT_NAME
});

const app = new App({
	key: APP_KEY
});

export const libContent = new LibContent({
	server
});

const myAppSiteConfig: SiteConfig<{
	foo: string
}> = {
	applicationKey: APP_KEY,
	config: {
		foo: 'bar'
	}
}

const siteContent = libContent.create({
	contentType: CONTENT_TYPE_PORTAL_SITE,
	data: {
		siteConfig: myAppSiteConfig,
	},
	name: SITE_NAME,
	parentPath: '/',
});

// const textComponentFragmentContent = libContent.create({
// 	// _path: "/mysite/fragment-info-header-header-text-info",
// 	// attachments: {},
// 	// createdTime: "2024-11-05T09:13:48.488533Z",
// 	// creator: "user:system:su",
// 	// hasChildren: false,
// 	// modifiedTime: "2024-11-05T09:13:48.568588Z",
// 	// modifier: "user:system:su",
// 	// owner: "user:system:su",
// 	// publish: {},
// 	// valid: true,
// 	childOrder: "modifiedtime DESC",
// 	contentType: 'portal:fragment',
// 	data: {},
// 	displayName: '[info header="Header"]Text[/info]',
// 	// @ts-expect-error TODO Support in @enonic/mock-xp
// 	fragment: {
// 		type: 'text',
// 		text: UNPROCESSED_HTML,
// 	},
// 	name: "fragment-info-header-header-text-info",
// 	parentPath: siteContent._path,
// 	x: {},
// });
// console.error('textComponentFragmentContent', textComponentFragmentContent);

export const libPortal = new LibPortal({
	app,
	server
});

const mode = 'edit';
// const mode = 'inline';
// const mode = 'live';
// const mode = 'preview';
libPortal.request = new Request({
	repositoryId: server.context.repository,
	mode, // For some reason this makes getSiteConfig fail???
	path: `/admin/site/${mode}/${PROJECT_NAME}/draft/${SITE_NAME}`
});

jest.mock('/lib/xp/content', () => ({
	// @ts-expect-error
	get: jest.fn<typeof getContentByKeyType>((params) => {
		const {key} = params;
		if (key === TEXT_FRAGMENT_CONTENT_ID) return TEXT_FRAGMENT_CONTENT;
		if (key === PART_FRAGMENT_CONTENT_ID) return PART_FRAGMENT_CONTENT;
		if (key === LAYOUT_FRAGMENT_CONTENT_ID) return LAYOUT_FRAGMENT_CONTENT;
		return libContent.get(params);
	}),
}), { virtual: true });

jest.mock('/lib/xp/portal', () => ({
	assetUrl: jest.fn<AssetUrl>((params) => libPortal.assetUrl(params)),
	getContent: jest.fn<typeof getCurrentContentType>(() => libPortal.getContent()),
	getSiteConfig: jest.fn<GetSiteConfig>(() => libPortal.getSiteConfig()),
	imageUrl: jest.fn<typeof imageUrlType>((params) => libPortal.imageUrl(params)),
	processHtml: jest.fn<ProcessHtml>((params) => PROCESSED_HTML),
}), { virtual: true });
