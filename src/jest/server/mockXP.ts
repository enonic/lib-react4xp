import type {
	get as getContentByKeyType,
} from '@enonic-types/lib-content';
import type {
	SiteConfig,
	assetUrl,
	getContent as getCurrentContentType,
	getSiteConfig,
	imageUrl as imageUrlType,
	processHtml,
} from '@enonic-types/lib-portal';
import type {
	MixinSchema,
	getComponent as getComponentSchema,
 	listSchemas
} from '@enonic-types/lib-schema';

type AssetUrl = typeof assetUrl;
type ProcessHtml = typeof processHtml;
type GetSiteConfig = typeof getSiteConfig;

import {
	App,
	LibContent,
	LibPortal,
	Request,
	Server
} from '@enonic/mock-xp';
import {
	CONTENT_TYPE_PORTAL_SITE,
} from '@enonic/mock-xp/dist/constants';
import {jest} from '@jest/globals';

import {
	// DEFAULT_PAGE_DESCRIPTOR,
	// EXAMPLE_PART_DESCRIPTOR,
	// LAYOUT_COMPONENT,
	// LAYOUT_FRAGMENT_CONTENT_ID,
	// LAYOUT_FRAGMENT_CONTENT,
	// PAGE_COMPONENT,
	// PAGE_CONTENT,
	// PART_COMPONENT,
	// PART_FRAGMENT_CONTENT_ID,
	// PART_FRAGMENT_CONTENT,
	PROCESSED_HTML,
	// TEXT_FRAGMENT_CONTENT_ID,
	// TEXT_FRAGMENT_CONTENT,
	// TWO_COLUMNS_LAYOUT_DESCRIPTOR,
} from './data';
import {
	LAYOUT_SCHEMA,
	MIXIN_SCHEMAS,
	PART_SCHEMA,
	PAGE_SCHEMA,
} from './schema';

const APP_KEY = 'com.example.myproject';
const PROJECT_NAME = 'myproject';
const SITE_NAME = 'mysite';


export const server = new Server({
	loglevel: 'debug'
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

export const libPortal = new LibPortal({
	app,
	server
});

libPortal.request = new Request({
	repositoryId: server.context.repository,
	path: `/admin/site/preview/${PROJECT_NAME}/draft/${SITE_NAME}`
});

jest.mock('/lib/xp/content', () => ({
	get: jest.fn<typeof getContentByKeyType>((params) => libContent.get(params)),
}), { virtual: true });

jest.mock('/lib/xp/portal', () => ({
	assetUrl: jest.fn<AssetUrl>((params) => libPortal.assetUrl(params)),
	getContent: jest.fn<typeof getCurrentContentType>(() => libPortal.getContent()),
	getSiteConfig: jest.fn<GetSiteConfig>(() => libPortal.getSiteConfig()),
	imageUrl: jest.fn<typeof imageUrlType>((params) => libPortal.imageUrl(params)),
	processHtml: jest.fn<ProcessHtml>((params) => PROCESSED_HTML),
}), { virtual: true });

jest.mock('/lib/xp/schema', () => ({
	getComponent: jest.fn<typeof getComponentSchema>(({type}) => {
		if (type === 'PART') return PART_SCHEMA;
			if (type === 'LAYOUT') return LAYOUT_SCHEMA;
			return PAGE_SCHEMA;
	}),
	listSchemas: jest.fn<typeof listSchemas>(() => MIXIN_SCHEMAS as MixinSchema[]),
}), { virtual: true });
