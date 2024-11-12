import type {
	Component,
	// Part,
	// PartComponent,
	Request,
} from '@enonic-types/core';
// import type {
// 	ListDynamicSchemasParams,
// 	MixinSchema,
// } from '@enonic-types/lib-schema';
// import type {RegionsProps} from '../../src/Regions';
// import type {MacroComponent} from '../../src/types';
// import type {InfoPanelProps} from './InfoPanel';
import type {
	// DecoratedLayoutComponent,
	DecoratedPageComponent,
	// DecoratedPartComponent
} from '@enonic/react-components';

// import {
//     ComponentRegistry,
//     XpComponent,
//     // XpRegion
// } from '@enonic/react-components';
import {
	// beforeAll,
	// afterAll,
	describe,
	expect,
	test as it
} from '@jest/globals';
// import {render} from '@testing-library/react'
// import toDiffableHtml from 'diffable-html';
// import {print, stringify} from 'q-i';
// import * as React from 'react';

//──────────────────────────────────────────────────────────────────────────────
// SRC imports
//──────────────────────────────────────────────────────────────────────────────
// import Regions from '../../src/Regions';
// import Page from '../../src/Page';
// import {RichText} from '../../src/RichText';
// import {replaceMacroComments} from '../../src/replaceMacroComments';
import {
	DataFetcher,
	// processComponents,
} from '/lib/enonic/react4xp/DataFetcher';
// import {InfoPanel} from './InfoPanel';

//──────────────────────────────────────────────────────────────────────────────
// TEST imports
//──────────────────────────────────────────────────────────────────────────────
import {
	DEFAULT_PAGE_DESCRIPTOR,
	EXAMPLE_PART_DESCRIPTOR,
	LAYOUT_COMPONENT,
	LAYOUT_FRAGMENT_CONTENT_ID,
	LAYOUT_FRAGMENT_CONTENT,
	PAGE_COMPONENT,
	PAGE_CONTENT,
	PART_COMPONENT,
	PART_FRAGMENT_CONTENT_ID,
	PART_FRAGMENT_CONTENT,
	PROCESSED_HTML,
	TEXT_FRAGMENT_CONTENT_ID,
	TEXT_FRAGMENT_CONTENT,
	TWO_COLUMNS_LAYOUT_DESCRIPTOR,
} from './data';
import {
	LAYOUT_SCHEMA,
	MIXIN_SCHEMAS,
	PART_SCHEMA,
	PAGE_SCHEMA,
} from './schema';
// import {DefaultPage} from './DefaultPage';
// import {ExamplePart} from './ExamplePart';
// import {TwoColumnLayout} from './TwoColumnLayout';

const dataFetcher = new DataFetcher(
    // {
	// getComponentSchema: ({
	// 	// key,
	// 	type,
	// }) => {
	// 	if (type === 'PART') return PART_SCHEMA;
	// 	if (type === 'LAYOUT') return LAYOUT_SCHEMA;
	// 	return PAGE_SCHEMA;
	// },
	// // @ts-expect-error
	// getContentByKey: ({key}) => {
	// 	if (key === LAYOUT_FRAGMENT_CONTENT_ID) {
	// 		return LAYOUT_FRAGMENT_CONTENT;
	// 	}
	// 	if (key === PART_FRAGMENT_CONTENT_ID) {
	// 		return PART_FRAGMENT_CONTENT;
	// 	}
	// 	if (key === TEXT_FRAGMENT_CONTENT_ID) {
	// 		return TEXT_FRAGMENT_CONTENT;
	// 	}
	// 	console.error("getContentByKey:", key);
	// 	return undefined;
	// },
	// listSchemas: ({
	// 	application: _application,
	// 	type,
	// }: ListDynamicSchemasParams) => {
	// 	if (type === 'MIXIN') {
	// 		return MIXIN_SCHEMAS as MixinSchema[];
	// 	}
	// 	// ContentSchemaType[]
	// 	// XDataSchema[]
	// 	throw new Error(`listSchemas: type: ${type} not mocked.`);
	// },
	// processHtml: ({ value }) => {
	// 	// console.info("processHtml:", value);
	// 	return PROCESSED_HTML;
	// },
// }
);
dataFetcher.addLayout(TWO_COLUMNS_LAYOUT_DESCRIPTOR, {
	toProps: ({
		component,
		content,
		processedComponent,
		processedConfig,
		request,
	}) => {
		const {regions} = processedComponent;
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
	toProps: ({
		component,
		content,
		processedComponent,
		processedConfig,
		request,
	}) => {
		// console.debug('page toProps:', {
		// 	// component,
		// 	// content,
		// 	processedComponent,
		// 	processedConfig,
		// 	// request
		// });
		const {regions} = processedComponent;
		return {
			regions
		};
	},
});
dataFetcher.addPart(EXAMPLE_PART_DESCRIPTOR, {
	toProps: ({
		component,
		content,
		processedConfig,
		request,
	}) => {
		// console.debug("part toProps:", { component, content, processedConfig, request });
		return {
			data: processedConfig.anHtmlArea
		};
	},
});

// const componentRegistry = new ComponentRegistry;
// componentRegistry.addMacro<InfoPanelProps>('info', {
// 	View: InfoPanel
// });
// componentRegistry.addPart(EXAMPLE_PART_DESCRIPTOR, {
// 	View: ExamplePart
// });
// componentRegistry.addLayout(TWO_COLUMNS_LAYOUT_DESCRIPTOR, {
// 	View: TwoColumnLayout
// });
// componentRegistry.addPage(DEFAULT_PAGE_DESCRIPTOR, {
// 	View: DefaultPage
// });

describe('processComponents', () => {

	// 	it('is able to process a part component', () => {
// 		const processedComponent = dataFetcher.process({
// 			component: PART_COMPONENT as Component,
// 			content: PAGE_CONTENT,
// 			request: {} as Request,
// 		});
// 		// print(processedComponent, { maxItems: Infinity });
// 		expect(processedComponent.props).toEqual({
// 			data: {
// 				processedHtml: '<editor-macro data-macro-name="info" data-macro-ref="1"></editor-macro>',
// 				macros: [
// 					{
// 						config: {
// 						info: {
// 							header: 'Header',
// 							body: 'Text'
// 						}
// 						},
// 						ref: '1',
// 						name: 'info',
// 						descriptor: 'whatever:info'
// 					}
// 				]
// 			}
// 		});
// // 		const element = render(<XpRegion
// // 			as='main'
// // 			components= {[processedComponent]}
// // 			componentRegistry={componentRegistry}
// // 			name='main'
// // 		/>).container;
// // 		expect(toDiffableHtml(element.outerHTML)).toEqual(toDiffableHtml(`
// // <div>
// // 	<main
// // 		class="xp-region"
// // 		data-portal-region="main"
// // 	>
// // 		<div>
// // 			<section>
// // 				<div
// // 					class="macro-panel macro-panel-info macro-panel-styled"
// // 				>
// // 					<i class="icon">
// // 					</i>
// // 					<strong>
// // 						Header
// // 					</strong>
// // 					Text
// // 				</div>
// // 			</section>
// // 		</div>
// // 	</main>
// // </div>
// // `));
// 	});

	// it('is able to process a layout component', () => {
	// 	const processedComponent = dataFetcher.process({
	// 		component: LAYOUT_COMPONENT as Component,
	// 		content: PAGE_CONTENT,
	// 		request: {} as Request,
	// 	}) as DecoratedLayoutComponent;
	// 	// print(processedComponent, { maxItems: Infinity });
	// 	// expect(processedComponent.props).toEqual({
	// 	// 	data: {
	// 	// 		processedHtml: '<editor-macro data-macro-name="info" data-macro-ref="1"></editor-macro>',
	// 	// 		macros: [
	// 	// 			{
	// 	// 				config: {
	// 	// 				info: {
	// 	// 					header: 'Header',
	// 	// 					body: 'Text'
	// 	// 				}
	// 	// 				},
	// 	// 				ref: '1',
	// 	// 				name: 'info',
	// 	// 				descriptor: 'whatever:info'
	// 	// 			}
	// 	// 		]
	// 	// 	}
	// 	// });
	// 	const element = render(<XpComponent
	// 		component= {processedComponent}
	// 		componentRegistry={componentRegistry}
	// 	/>).container;
	// 	// console.debug(toDiffableHtml(element.outerHTML));
	// 	expect(toDiffableHtml(element.outerHTML)).toEqual(toDiffableHtml(`
	// 		<div>
	// 			<div style="column-gap: 1em; display: grid; grid-template-columns: 1fr 1fr;">
	// 				<div
	// 					class="xp-region"
	// 					data-portal-region="left"
	// 				>
	// 					<div>
	// 						<section>
	// 						<div class="macro-panel macro-panel-info macro-panel-styled">
	// 							<i class="icon">
	// 							</i>
	// 							<strong>
	// 							Header
	// 							</strong>
	// 							Text
	// 						</div>
	// 						</section>
	// 					</div>
	// 				</div>
	// 				<div
	// 					class="xp-region"
	// 					data-portal-region="right"
	// 				>
	// 				</div>
	// 			</div>
	// 		</div>
	// 	`));
	// });

	it('is able to process a page component', () => {
		const decoratedPageComponent = dataFetcher.process({
			component: PAGE_COMPONENT as Component,
			content: PAGE_CONTENT,
			request: {} as Request,
		}) as DecoratedPageComponent;
		// print(decoratedPageComponent, { maxItems: Infinity });
		// expect(decoratedPageComponent.props).toEqual({
		// 	data: {
		// 		processedHtml: '<editor-macro data-macro-name="info" data-macro-ref="1"></editor-macro>',
		// 		macros: [
		// 			{
		// 				config: {
		// 				info: {
		// 					header: 'Header',
		// 					body: 'Text'
		// 				}
		// 				},
		// 				ref: '1',
		// 				name: 'info',
		// 				descriptor: 'whatever:info'
		// 			}
		// 		]
		// 	}
		// });
		// const element = render(<XpComponent
		// 	component={decoratedPageComponent}
		// 	componentRegistry={componentRegistry}
		// />).container;
		// // console.debug(toDiffableHtml(element.outerHTML));
		// expect(toDiffableHtml(element.outerHTML)).toEqual(toDiffableHtml(`
		// 	<div>
		// 		<div class="default-page">
		// 			<div
		// 				class="xp-region"
		// 				data-portal-region="main"
		// 			>
		// 				<div>
		// 					<section>
		// 						<div
		// 							class="macro-panel macro-panel-info macro-panel-styled"
		// 						>
		// 							<i class="icon">
		// 							</i>
		// 							<strong>
		// 								Header
		// 							</strong>
		// 							Text
		// 						</div>
		// 					</section>
		// 				</div>
		// 			</div>
		// 		</div>
		// 	</div>
		// `));
	});
});
