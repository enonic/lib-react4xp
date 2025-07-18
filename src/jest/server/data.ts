import type {LayoutComponent, PageComponent, PartComponent, FragmentComponent, TextComponent} from '@enonic-types/core';
import type {PageContent} from '/lib/enonic/react4xp/DataFetcher';

import {HTML_AREA_KEY, ITEM_SET_KEY, OPTION_SET_KEY} from './constants';

export const UNPROCESSED_HTML = '<p>[info header="Header"]Text[/info]</p>';
export const PROCESSED_HTML = `<p><!--#MACRO _name="info" header="Header" _document="__macroDocument1" _body="Text"--></p>`

export const CONFIG = {
	[HTML_AREA_KEY]: UNPROCESSED_HTML,
	[ITEM_SET_KEY]: {
		[HTML_AREA_KEY]: UNPROCESSED_HTML,
	},
	[OPTION_SET_KEY]: [
		{
			hr: {},
			_selected: "hr",
		},
		{
			text: {
				[HTML_AREA_KEY]: UNPROCESSED_HTML,
			},
			_selected: "text",
		},
	],
};

export const TEXT_COMPONENT: TextComponent = {
	path: "/main/0",
	type: "text",
	text: UNPROCESSED_HTML,
};

export const EXAMPLE_PART_DESCRIPTOR = "com.enonic.app.react4xp:example";

export const PART_COMPONENT: PartComponent = {
	path: "/main/0/left/0",
	type: "part",
	descriptor: EXAMPLE_PART_DESCRIPTOR,
	config: CONFIG,
};

export const LAYOUT_FRAGMENT_CONTENT_ID = '8c926279-39bd-4bff-a502-ffe921b95ada';
export const PART_FRAGMENT_CONTENT_ID = '6a71fd9e-f9fc-4395-8954-1d67a5e35bf3';
export const TEXT_FRAGMENT_CONTENT_ID = 'a641b21d-1af3-4559-a936-9e1ab71a19c4';

export const PART_COMPONENT_FRAGMENT: FragmentComponent = {
	path: "/main/0",
	type: "fragment",
	fragment: PART_FRAGMENT_CONTENT_ID,
};

export const TEXT_COMPONENT_FRAGMENT: FragmentComponent = {
	path: "/main/1",
	type: "fragment",
	fragment: TEXT_FRAGMENT_CONTENT_ID,
};

export const LAYOUT_COMPONENT_FRAGMENT: FragmentComponent = {
	path: "/main/5",
	type: "fragment",
	fragment: LAYOUT_FRAGMENT_CONTENT_ID,
};

export const TWO_COLUMNS_LAYOUT_DESCRIPTOR = "com.enonic.app.react4xp:twoColumns";

export const LAYOUT_FRAGMENT_CONTENT = {
	_id: LAYOUT_FRAGMENT_CONTENT_ID,
	_name: "fragment-two-columns",
	_path: "/mysite/page-with-layout-fragment-with-text-and-part-fragment/fragment-two-columns",
	creator: "user:system:su",
	modifier: "user:system:su",
	createdTime: "2024-11-05T09:38:31.175061Z",
	modifiedTime: "2024-11-05T09:38:31.280283Z",
	owner: "user:system:su",
	type: "portal:fragment",
	displayName: "Two columns",
	hasChildren: false,
	valid: true,
	childOrder: "modifiedtime DESC",
	data: {},
	x: {},
	fragment: {
		type: "layout",
		descriptor: TWO_COLUMNS_LAYOUT_DESCRIPTOR,
		config: {
			myhtmlarea: '<p>[info header="Header"]Text[/info]</p>\n',
		},
		regions: {
			left: {
				components: [
					{...TEXT_COMPONENT, path: "/left/0"},
					{
						path: "/left/1",
						type: "fragment",
						fragment: TEXT_FRAGMENT_CONTENT_ID,
					},
				],
				name: "left",
			},
			right: {
				components: [
					{...PART_COMPONENT, path: "/right/0"},
					{
						path: "/right/1",
						type: "fragment",
						fragment: PART_FRAGMENT_CONTENT_ID,
					},
				],
				name: "right",
			}
		},
	},
	attachments: {},
	publish: {},
};

export const TEXT_FRAGMENT_CONTENT = {
	_id: TEXT_FRAGMENT_CONTENT_ID,
	_name: "fragment-info-header-header-text-info",
	_path: "/mysite/fragment-info-header-header-text-info",
	creator: "user:system:su",
	modifier: "user:system:su",
	createdTime: "2024-11-05T09:13:48.488533Z",
	modifiedTime: "2024-11-05T09:13:48.568588Z",
	owner: "user:system:su",
	type: "portal:fragment",
	displayName: '[info header="Header"]Text[/info]',
	hasChildren: false,
	valid: true,
	childOrder: "modifiedtime DESC",
	data: {},
	x: {},
	fragment: {
		type: 'text',
		text: UNPROCESSED_HTML,
	},
	attachments: {},
	publish: {},
};

export const PART_FRAGMENT_CONTENT = {
	_id: PART_FRAGMENT_CONTENT_ID,
	_name: "fragment-example",
	_path: "/mysite/with-fragment/fragment-example",
	creator: "user:system:su",
	modifier: "user:system:su",
	createdTime: "2024-10-30T08:19:49.053500Z",
	modifiedTime: "2024-10-30T08:19:49.122382Z",
	owner: "user:system:su",
	type: "portal:fragment",
	displayName: "example",
	hasChildren: false,
	valid: true,
	childOrder: "modifiedtime DESC",
	data: {},
	x: {},
	fragment: {
		type: "part",
		descriptor: EXAMPLE_PART_DESCRIPTOR,
		config: CONFIG,
	},
	attachments: {},
	publish: {},
};

export const LAYOUT_COMPONENT: LayoutComponent = {
	path: '/main/4',
	type: 'layout',
	descriptor: TWO_COLUMNS_LAYOUT_DESCRIPTOR,
	config: CONFIG,
	regions: {
		left: {
			components: [
				{...TEXT_COMPONENT, path: '/main/4/left/0'},
				{...TEXT_COMPONENT_FRAGMENT, path: '/main/4/left/1'},

			],
			name: "left",
		},
		right: {
			components: [
				{...PART_COMPONENT, path: '/main/4/right/0'},
				{...PART_COMPONENT_FRAGMENT, path: '/main/4/right/1'},
			],
			name: "right",
		},
	},
};

export const DEFAULT_PAGE_DESCRIPTOR = "com.enonic.app.react4xp:default";

export const PAGE_COMPONENT: PageComponent = {
	type: "page",
	path: "/",
	descriptor: DEFAULT_PAGE_DESCRIPTOR,
	config: CONFIG,
	regions: {
		main: {
			components: [
				{...TEXT_COMPONENT, path: "/main/0"},
				{...TEXT_COMPONENT_FRAGMENT, path: "/main/1"},
				{...PART_COMPONENT, path: "/main/2"},
				{...PART_COMPONENT_FRAGMENT, path: "/main/3"},
				{...LAYOUT_COMPONENT, path: "/main/4"},
				{...LAYOUT_COMPONENT_FRAGMENT, path: "/main/5"},
			],
			name: "main",
		},
	},
};

export const PAGE_CONTENT: PageContent = {
	_id: "3e36f69a-fa2f-4943-a812-5a2d06f22e56",
	_name: "mysite",
	_path: "/mysite",
	creator: "user:system:su",
	modifier: "user:system:su",
	createdTime: "2024-10-30T08:14:10.575402Z",
	modifiedTime: "2024-11-05T09:36:11.782402Z",
	owner: "user:system:su",
	type: "portal:site",
	displayName: "mysite",
	hasChildren: true,
	valid: true,
	childOrder: "modifiedtime DESC",
	data: {
		siteConfig: [
			{
				applicationKey: "com.enonic.app.react4xp",
				config: {},
			},
			{
				applicationKey: "com.enonic.app.panelmacros",
				config: {
					custom: false,
				},
			},
		],
	},
	x: {},
	page: PAGE_COMPONENT,
	attachments: {},
	publish: {},
};
