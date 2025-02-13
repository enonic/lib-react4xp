import type {Component, Request, PageComponent, LayoutComponent} from '@enonic-types/core';
import type {RenderablePageComponent} from '@enonic/react-components';

import {describe, expect, test as it} from '@jest/globals';

//──────────────────────────────────────────────────────────────────────────────
// SRC imports
//──────────────────────────────────────────────────────────────────────────────
import {DataFetcher} from '/lib/enonic/react4xp/DataFetcher';

//──────────────────────────────────────────────────────────────────────────────
// TEST imports
//──────────────────────────────────────────────────────────────────────────────
import {DEFAULT_PAGE_DESCRIPTOR, EXAMPLE_PART_DESCRIPTOR, PAGE_COMPONENT, PAGE_CONTENT, TWO_COLUMNS_LAYOUT_DESCRIPTOR} from './data';

const dataFetcher = new DataFetcher();
dataFetcher.addLayout(TWO_COLUMNS_LAYOUT_DESCRIPTOR, {
	processor: ({
					component,
					content,
					siteConfig,
					request,
				}) => {
		const {regions} = component as LayoutComponent;
		// console.debug('layout toProps:', stringify({
		// 	// component,
		// 	// content,
		// 	processedComponent,
		// 	processedConfig,
		// 	// request
		// }));
		return {
			// data: processedConfig.anHtmlArea,
			regions
		};
	},
});
dataFetcher.addPage(DEFAULT_PAGE_DESCRIPTOR, {
	processor: ({
					component,
					content,
					siteConfig,
					request,
				}) => {
		// console.debug('page toProps:', {
		// 	// component,
		// 	// content,
		// 	processedComponent,
		// 	processedConfig,
		// 	// request
		// });
		const {regions} = component as PageComponent;
		return {
			regions
		};
	},
});
dataFetcher.addPart(EXAMPLE_PART_DESCRIPTOR, {
	processor: ({
					component,
					content,
					siteConfig,
					request,
				}) => {
		// console.debug("part toProps:", { component, content, processedConfig, request });
		return {
			data: siteConfig.anHtmlArea
		};
	},
});

const renderablePageComponent = dataFetcher.process({
	component: PAGE_COMPONENT as Component,
	content: PAGE_CONTENT,
	request: {} as Request,
}) as RenderablePageComponent;

const {components} = renderablePageComponent.props.regions['main'];
// console.info('components:%s', stringify(components, { maxItems: Infinity }));
const textComponent = components[0];
const textComponentFragment = components[1];
const partComponent = components[2];
const partComponentFragment = components[3];
const layoutComponent = components[4];
const layoutComponentFragment = components[5];

describe('DataFetcher', () => {

	it('the page component should not have a config property', () => {
		// @ts-expect-error config is not defined
		expect(renderablePageComponent.config).toBeUndefined();
	});

	it('is able to process a text component', () => {
		// console.info('textComponent:%s', stringify(textComponent, { maxItems: Infinity }));
		expect(textComponent.props).toEqual({
			data: {
				processedHtml: '<editor-macro data-macro-name="info" data-macro-ref="1"></editor-macro>',
				macros: [
					{
						config: {
							info: {
								header: 'Header',
								body: 'Text'
							}
						},
						ref: '1',
						name: 'info',
						descriptor: 'whatever:info'
					}
				]
			},
			//   mode: 'edit' // TODO
		});
	});

	it('is able to process a text fragment component', () => {
		// console.info('textComponentFragment:%s', stringify(textComponentFragment, { maxItems: Infinity }));
		expect(textComponentFragment.props).toEqual({
			data: {
				processedHtml: '<editor-macro data-macro-name="info" data-macro-ref="1"></editor-macro>',
				macros: [
					{
						config: {
							info: {
								header: 'Header',
								body: 'Text'
							}
						},
						ref: '1',
						name: 'info',
						descriptor: 'whatever:info'
					}
				]
			},
			//   mode: 'edit' // TODO
		});
	});

	it('is able to process a part component', () => {
		// console.info('partComponent:%s', stringify(partComponent, { maxItems: Infinity }));
		expect(partComponent.props).toEqual({
			data: {
				processedHtml: '<editor-macro data-macro-name="info" data-macro-ref="1"></editor-macro>',
				macros: [
					{
						config: {
							info: {
								header: 'Header',
								body: 'Text'
							}
						},
						ref: '1',
						name: 'info',
						descriptor: 'whatever:info'
					}
				]
			},
			//   mode: 'edit' // TODO
		});
	});

	it('the part component should not have a config property', () => {
		expect(partComponent.config).toBeUndefined();
	});

	it('is able to process a part fragment component', () => {
		// console.info('partComponentFragment:%s', stringify(partComponentFragment, { maxItems: Infinity }));
		expect(partComponentFragment.props).toEqual({
			data: {
				processedHtml: '<editor-macro data-macro-name="info" data-macro-ref="1"></editor-macro>',
				macros: [
					{
						config: {
							info: {
								header: 'Header',
								body: 'Text'
							}
						},
						ref: '1',
						name: 'info',
						descriptor: 'whatever:info'
					}
				]
			},
			//   mode: 'edit' // TODO
		});
	});

	it('the part fragment component should not have a config property', () => {
		expect(partComponentFragment.config).toBeUndefined();
	});

	it('is able to process a layout component', () => {
		// console.info('layoutComponent:%s', stringify(layoutComponent, { maxItems: Infinity }));
		expect(layoutComponent.props).toEqual({
			regions: {
				left: {
					components: [
						{
							path: '/main/4/left/0',
							type: 'text',
							text: '<p>[info header="Header"]Text[/info]</p>',
							props: {
								data: {
									processedHtml: '<editor-macro data-macro-name="info" data-macro-ref="1"></editor-macro>',
									macros: [
										{
											config: {
												info: {
													header: 'Header',
													body: 'Text'
												}
											},
											ref: '1',
											name: 'info',
											descriptor: 'whatever:info'
										}
									]
								}
							}
						},
						{
							type: 'text',
							text: '<p>[info header="Header"]Text[/info]</p>',
							path: '/main/1',
							props: {
								data: {
									processedHtml: '<editor-macro data-macro-name="info" data-macro-ref="1"></editor-macro>',
									macros: [
										{
											config: {
												info: {
													header: 'Header',
													body: 'Text'
												}
											},
											ref: '1',
											name: 'info',
											descriptor: 'whatever:info'
										}
									]
								},
								mode: undefined
							}
						}
					],
					name: 'left'
				},
				right: {
					components: [
						{
							descriptor: 'com.enonic.app.react4xp:example',
							path: '/main/4/right/0',
							type: 'part',
							props: {
								data: {
									processedHtml: '<editor-macro data-macro-name="info" data-macro-ref="1"></editor-macro>',
									macros: [
										{
											config: {
												info: {
													header: 'Header',
													body: 'Text'
												}
											},
											ref: '1',
											name: 'info',
											descriptor: 'whatever:info'
										}
									]
								}
							}
						},
						{
							descriptor: 'com.enonic.app.react4xp:example',
							path: '/main/3',
							type: 'part',
							props: {
								data: {
									processedHtml: '<editor-macro data-macro-name="info" data-macro-ref="1"></editor-macro>',
									macros: [
										{
											config: {
												info: {
													header: 'Header',
													body: 'Text'
												}
											},
											ref: '1',
											name: 'info',
											descriptor: 'whatever:info'
										}
									]
								}
							}
						}
					],
					name: 'right'
				}
			}
		});
	});

	it('the layout component should not have a config property', () => {
		// console.info('layoutComponent:%s', stringify(layoutComponent, { maxItems: Infinity }));
		expect(layoutComponent.config).toBeUndefined();
	});

	it("is able to process a layout component fragment", () => {
		// console.info("layoutComponentFragment:%s", stringify(layoutComponentFragment, { maxItems: Infinity }));
		expect(layoutComponentFragment.props).toEqual({
			regions: {
				left: {
					components: [
						{
							path: "/left/0",
							type: "text",
							text: '<p>[info header="Header"]Text[/info]</p>',
							props: {
								data: {
									processedHtml:
										'<editor-macro data-macro-name="info" data-macro-ref="1"></editor-macro>',
									macros: [
										{
											config: {
												info: {
													header: "Header",
													body: "Text",
												},
											},
											ref: "1",
											name: "info",
											descriptor: "whatever:info",
										},
									],
								},
								mode: undefined,
							},
						},
						{
							type: "text",
							text: '<p>[info header="Header"]Text[/info]</p>',
							// path: "/left/1", // TODO
							path: "/main/1",
							props: {
								data: {
									processedHtml:
										'<editor-macro data-macro-name="info" data-macro-ref="1"></editor-macro>',
									macros: [
										{
											config: {
												info: {
													header: "Header",
													body: "Text",
												},
											},
											ref: "1",
											name: "info",
											descriptor: "whatever:info",
										},
									],
								},
								mode: undefined,
							},
						},
					],
					name: "left",
				},
				right: {
					components: [
						{
							descriptor: "com.enonic.app.react4xp:example",
							path: "/right/0",
							type: "part",
							props: {
								data: {
									processedHtml:
										'<editor-macro data-macro-name="info" data-macro-ref="1"></editor-macro>',
									macros: [
										{
											config: {
												info: {
													header: "Header",
													body: "Text",
												},
											},
											ref: "1",
											name: "info",
											descriptor: "whatever:info",
										},
									],
								},
							},
						},
						{
							descriptor: "com.enonic.app.react4xp:example",
							// path: "/right/1", // TODO
							path: "/main/3",
							type: "part",
							props: {
								data: {
									processedHtml:
										'<editor-macro data-macro-name="info" data-macro-ref="1"></editor-macro>',
									macros: [
										{
											config: {
												info: {
													header: "Header",
													body: "Text",
												},
											},
											ref: "1",
											name: "info",
											descriptor: "whatever:info",
										},
									],
								},
							},
						},
					],
					name: "right",
				},
			},
		});
	});

	it('the layout component fragment should not have a config property', () => {
		expect(layoutComponentFragment.config).toBeUndefined();
	});
});
