import type {
	Component,
	Content,
	FragmentComponent,
	LayoutComponent,
	LayoutDescriptor,
	Merge,
	PageComponent,
	PageDescriptor,
	PartComponent,
	PartDescriptor,
	Request,
	TextComponent,
	ComponentDescriptor
} from '@enonic-types/core';
import type {
	ProcessedData,
	ProcessedContentType,
	ProcessedError,
	ProcessedLayout,
	ProcessedPage,
	ProcessedPart,
	ProcessedText,
	ProcessedWarning,
	XpRunMode
} from '@enonic/react-components/dist/nashorn';
import type {ContextParams} from '@enonic-types/lib-context';
import {toStr} from '@enonic/js-utils/value/toStr';


import {get as getContentByKey} from '/lib/xp/content';
import {getContent as getCurrentContent} from '/lib/xp/portal';


import {REQUEST_METHOD, REQUEST_MODE} from '/lib/enonic/react4xp/constants';
import {IS_DEV_MODE} from '/lib/enonic/react4xp/xp/appHelper';

import {processHtml} from '/lib/enonic/react4xp/dataFetcher/processHtml';
import {ProcessedRegions} from '@enonic/react-components/dist/types/ProcessedData';

export type FragmentContent<
	COMPONENT extends LayoutComponent | PartComponent = LayoutComponent | PartComponent
> = Content<undefined, 'portal:fragment', COMPONENT>;

export type ShortcutContent = Content<{
	parameters: {
		name: string;
		value: string;
	}[];
	target: string;
}, 'base:shortcut'>;

export type PageContent<
	Data = Record<string, unknown>,
	Type extends string = string,
	Component extends PageComponent = PageComponent
> = Content<
	Data,
	Type,
	// @ts-expect-error Does not satisfy the type constraint
	Component
>

export type ComponentProcessorParams<
	DESCRIPTOR extends ComponentDescriptor = ComponentDescriptor,
	OVERRIDES extends Record<string, unknown> = Record<string, never>
> = Merge<{
	component: Component<DESCRIPTOR>;
	content?: PageContent;
	siteConfig?: Record<string, unknown> | null; // In passAlong
	request: Request;
	runMode: XpRunMode,
}, OVERRIDES>

export type ComponentProcessorFunction<
	DESCRIPTOR extends ComponentDescriptor = ComponentDescriptor,
	OVERRIDES extends Record<string, unknown> = Record<string, never>
> = (params: ComponentProcessorParams<DESCRIPTOR, OVERRIDES>) => Record<string, unknown>;


interface ProcessParams {
	[passAlongKey: string]: unknown;

	component?: Component;
	content?: PageContent;
	request: Request;
}

const RUN_MODE = IS_DEV_MODE ? 'development' : 'production';

const ADMIN_CONTEXT: ContextParams = {
	principals: ['role:system.schema.admin']
}

export class DataFetcher {
	private content: PageContent;
	private contentTypes: Record<PageDescriptor, ComponentProcessorFunction<PageDescriptor>> = {};
	private layouts: Record<LayoutDescriptor, ComponentProcessorFunction<LayoutDescriptor>> = {};
	private pages: Record<PageDescriptor, ComponentProcessorFunction<PageDescriptor>> = {};
	private parts: Record<PartDescriptor, ComponentProcessorFunction<PartDescriptor>> = {};
	private request: Request;

	private static getPath(name: string, ancestor?: string) {
		return ancestor ? `${ancestor}.${name}` : name;
	}

	constructor() {

	}

	private processContentType({
								   contentType,
								   ...passAlong
							   }: {
		[key: string]: unknown
		contentType: string
	}): ProcessedContentType {
		const processor = this.contentTypes[contentType];

		const props = processor({
			...passAlong,
			content: this.content,
			request: this.request,
			runMode: RUN_MODE,
		});

		return {
			// WARNING: Do NOT pass config, it should not be exposed to client-side hydration.
			contentType,
			mode: this.request.mode,
			props,
			type: 'contentType',
		};
	}

	private processFragment({
								component,
								...passAlong
							}: {
		component: FragmentComponent;
		siteConfig?: Record<string, unknown> | null; // In passAlong
	}): ProcessedPart | ProcessedLayout | ProcessedText | ProcessedError {
		// log.debug('dataFetcher.processFragment passAlong:%s', toStr(passAlong));
		const {
			fragment: key,
			path
		} = component;
		// log.info('processFragment fragment key:', key);

		// @ts-expect-error Too complex/strict type generics.
		const fragmentContent = getContentByKey<FragmentContent>({key});
		if (!fragmentContent) {
			// This probably rarely happens, only if content is imported or manipulated:
			log.error(`DataFetcher: processFragment: Fragment content NOT found for key:%s! Referenced in content:%s componentPath:%s`, key,
				this.content._id, path);

			/*//TODO: needs to be handled in app.ts
			if (this.request.mode === REQUEST_MODE.LIVE) {
				return {
					response: {
						status: 500
					}
				};
			}*/

			return {
				html: `<h1>Error</h1><p>Fragment content NOT found for key:${key}</p>`,
				mode: this.request.mode,
				path,
				type: 'error'
			}
		}
		// log.info('processFragment content:', content);

		const {fragment} = fragmentContent;
		if (!fragment) {
			// This probably never happens, only if content is b0rked:
			log.error(`DataFetcher: processFragment: B0rked Fragment content key:%s! Referenced in content:%s componentPath:%s`, key,
				this.content._id, path);

			/*//TODO: needs to be handled in app.ts
			if (this.request.mode === REQUEST_MODE.LIVE) {
				return {
					response: {
						status: 500
					}
				};
			}*/

			return {
				html: `<h1>Error</h1><p>Fragment NOT found in content with key:${key}</p>`,
				mode: this.request.mode,
				path,
				type: 'error'
			}
		}

		if (!fragment.path) {
			fragment.path = path;
		}
		// log.info('processFragment fragment:', fragment);

		const {type} = fragment;
		// log.info('processFragment fragment:', fragment);

		if (type === 'part') {
			return this.processPart({
				component: fragment,
				...passAlong
			});
		}
		if (type === 'layout') {
			return this.processLayout({
				component: fragment,
				...passAlong
			});
		}
		if (type === 'text') {
			return this.processTextComponent({
				component: fragment as TextComponent,
			});
		}
		// This probably never happens, only if data is b0rked:
		throw new Error(`processFragment: fragment type not supported: ${type}!`);
	}

	private processLayout({
							  component,
							  ...passAlong
						  }: {
		component: LayoutComponent;
		siteConfig?: Record<string, unknown> | null; // In passAlong
	}): ProcessedLayout {
		// log.debug('dataFetcher.processLayout passAlong:%s', toStr(passAlong));
		const {
			descriptor,
			path,
			regions
		} = component;
		const processedLayout: ProcessedLayout = {
			// Do not ass config, it should not be exposed to client-side
			descriptor,
			mode: this.request.mode,
			path,
			regions: JSON.parse(JSON.stringify(regions)), // TODO config should be stripped from child components?
			type: 'layout',
		};
		const processor = this.layouts[descriptor];
		if (!processor) {
			const msg = `DataFetcher: processLayout: No processor function added for layout descriptor: ${descriptor}!`;
			log.warning(msg);
			processedLayout.warning = msg;
			return processedLayout;
		}

		const layoutWithProcessedRegions = JSON.parse(JSON.stringify(component));
		layoutWithProcessedRegions.regions = this.processRegions(component);

		processedLayout.props = processor({
			...passAlong,
			component: layoutWithProcessedRegions,
			content: this.content,
			request: this.request,
			runMode: RUN_MODE,
		});

		return processedLayout;
	} // processLayout

	private processPage({
							component,
							...passAlong
						}: {
		component: PageComponent;
		siteConfig?: Record<string, unknown> | null; // In passAlong
	}): ProcessedPage | ProcessedWarning {

		const {
			descriptor,
			path, // Should always be '/'
			regions, // CAUTION: Is undefined when using page templates.
		} = component;
		// log.debug('processPage: regions:%s', toStr(regions));

		if (!descriptor) { // This could probably only happen on b0rked template content, or some caching mistake.

			if (
				this.request.params['mode'] === REQUEST_MODE.EDIT
				&& this.request.mode === REQUEST_MODE.INLINE
				&& this.request.method === REQUEST_METHOD.HEAD
			) {
				/*//TODO: needs to be handled in app.ts
				return {
					response: {
						// So Content Studio knowns the page is NOT renderable,
						// and the page selector dropdown is shown.
						status: 418
					}
				};*/
			}

			log.error(`processPage: descriptor not found for page component: ${toStr(component)} in content:${toStr(this.content)}!`);
			throw new Error(`processPage: descriptor not found for page component!`);
		}

		const processedPage: ProcessedPage = {
			// WARNING: Do NOT pass config, it should not be exposed to client-side.
			descriptor,
			mode: this.request.mode,
			path,
			regions: JSON.parse(JSON.stringify(regions)), // TODO config should be stripped from child components?
			type: 'page',
		};

		const processor = this.pages[descriptor];
		if (!processor) {
			const msg = `DataFetcher: processPage: No processor function added for page descriptor: ${descriptor}!`;
			log.warning(msg);
			processedPage.warning = msg;
			return processedPage;
		}

		const pageWithProcessedRegions = JSON.parse(JSON.stringify(component));
		pageWithProcessedRegions.regions = this.processRegions(component);

		processedPage.props = processor({
			...passAlong,
			component: pageWithProcessedRegions,
			content: this.content,
			request: this.request,
			runMode: RUN_MODE,
		});

		return processedPage;
	} // processPage

	private processPart({
							component,
							...passAlong
						}: {
		component: PartComponent;
		siteConfig?: Record<string, unknown> | null; // In passAlong
	}): ProcessedPart {
		// log.debug('dataFetcher.processPart passAlong:%s', toStr(passAlong));
		const {
			descriptor,
			path
		} = component;

		const processedPart: ProcessedPart = {
			descriptor,
			mode: this.request.mode,
			path,
			type: 'part',
		}
		const processor = this.parts[descriptor];
		if (!processor) {
			const msg = `DataFetcher: processPart: No processor function added for part descriptor: ${descriptor}!`;
			log.warning(msg);
			processedPart.warning = msg;
			return processedPart;
		}

		processedPart.props = processor({
			...passAlong,
			component: JSON.parse(JSON.stringify(component)),
			content: this.content,
			request: this.request,
			runMode: RUN_MODE,
		});

		return processedPart;
	} // processPart

	private processTextComponent({
									 component,
								 }: {
		component: TextComponent
	}): ProcessedText {
		const {text} = component;
		const renderableTextComponent: ProcessedText = JSON.parse(JSON.stringify(component));
		renderableTextComponent.mode = this.request.mode;
		renderableTextComponent.props = {
			data: processHtml(text)
		};
		// log.debug('processTextComponent text renderableTextComponent:%s', toStr(renderableTextComponent));
		return renderableTextComponent;
	}

	private processRegions(component: PageComponent | LayoutComponent): ProcessedRegions {

		const regions = JSON.parse(JSON.stringify(component.regions || {}));
		// log.debug('processWithRegions regions:', stringify(regions, {maxItems: Infinity}));
		const regionNames = Object.keys(regions);
		for (let i = 0; i < regionNames.length; i++) {
			const regionName = regionNames[i];
			const region = regions[regionName];
			const components = region.components;
			for (let j = 0; j < components.length; j++) {
				const origComponent = components[j];
				// log.info('processWithRegions i:%s, j:%s, component:%s', i, j, toStr(origComponent));
				const processedComponent = this.process({
					component: origComponent,
					// TODO This causes those instance properties to be written more than once.
					content: this.content,
					request: this.request,
				});
				if (processedComponent) {
					regions[regionName].components[j] = processedComponent;
				}
				/*if (response) {
					// This shouldn't happen, but if it does, log it.
					log.warning('processWithRegions response:%s', toStr(response));
				}*/
			}
		}
		// log.debug('processWithRegions regions:', stringify(processedLayoutOrPageComponent.regions, {maxItems: Infinity}));
		return regions;
	} // processRegions

	public addContentType<
		OVERRIDES extends Record<string, unknown> = Record<string, never>,
		PAGE_DESCRIPTOR extends PageDescriptor = PageDescriptor,
	>(contentTypeName: string, {
		processor
	}: {
		processor: ComponentProcessorFunction<PAGE_DESCRIPTOR, OVERRIDES>;
	}) {
		this.contentTypes[contentTypeName] = processor // as PageComponentProcessorFunction;
	}

	public addLayout<
		OVERRIDES extends Record<string, unknown> = Record<string, never>,
		LAYOUT_DESCRIPTOR extends LayoutDescriptor = LayoutDescriptor,
	>(descriptor: LAYOUT_DESCRIPTOR, {
		processor
	}: {
		processor: ComponentProcessorFunction<LAYOUT_DESCRIPTOR, OVERRIDES>;
	}) {
		// log.debug('addLayout:', descriptor);
		this.layouts[descriptor] = processor as ComponentProcessorFunction<LAYOUT_DESCRIPTOR>;
	}

	public addPage<
		OVERRIDES extends Record<string, unknown> = Record<string, never>,
		PAGE_DESCRIPTOR extends PageDescriptor = PageDescriptor,
	>(descriptor: PAGE_DESCRIPTOR, {
		processor
	}: {
		processor: ComponentProcessorFunction<PAGE_DESCRIPTOR, OVERRIDES>;
	}) {
		// log.debug('addPage:', descriptor);
		this.pages[descriptor] = processor as ComponentProcessorFunction<PAGE_DESCRIPTOR>;
	}

	public addPart<
		OVERRIDES extends Record<string, unknown> = Record<string, never>,
		PART_DESCRIPTOR extends PartDescriptor = PartDescriptor // gotten from the passed descriptor parameter below
	>(descriptor: PART_DESCRIPTOR, {
		processor
	}: {
		processor: ComponentProcessorFunction<PART_DESCRIPTOR, OVERRIDES>;
	}) {
		// log.debug('addPart:', descriptor);
		this.parts[descriptor] = processor as ComponentProcessorFunction<PART_DESCRIPTOR>;
	}

	public hasContentType(name: string): boolean {
		return this.contentTypes[name] !== undefined;
	}

	public hasLayout(name: string): boolean {
		return this.layouts[name] !== undefined;
	}

	public hasPage(name: string): boolean {
		return this.pages[name] !== undefined;
	}

	public hasPart(name: string): boolean {
		return this.parts[name] !== undefined;
	}

	public process({
					   component,
					   content,
					   request,
					   ...passAlong
				   }: ProcessParams): ProcessedData {
		if (!request) {
			throw new Error(`process: request is required!`);
		}
		this.request = request;
		// log.debug('dataFetcher.process passAlong:%s', toStr(passAlong));
		// content = this.getCurrentContent && this.getCurrentContent() as PageContent
		if (!content) {
			content = getCurrentContent!() as PageContent;
			if (!content) {
				log.error(`process: getCurrentContent returned null!`);
				/*// TODO: needs to be handled in app.ts
				return {
					response: {
						status: 404
					}
				}*/
			}
		}
		this.content = content;

		// const { method } = request;
		const {type: contentType} = content;

		// if (method === REQUEST_METHOD.HEAD) {}

		if (this.hasContentType(contentType)) {
			return this.processContentType({
				...passAlong,
				contentType,
			});
		}

		if (!component) {
			component = (content.page || content.fragment) as Component;
			if (!component) {
				throw new Error(`process: component not passed and neither content.page nor content.fragment is found!`);
			}
		}
		const {
			type: componentType // CAUTION: Is undefined when using page templates.
		} = component;
		switch (componentType) {
		case 'part':
			return this.processPart({
				component,
				...passAlong
			});
		case 'layout':
			return this.processLayout({
				component: component as LayoutComponent,
				...passAlong
			});
		case 'text':
			return this.processTextComponent({
				component: component as TextComponent,
			});
		case 'fragment':
			return this.processFragment({
				component: component as FragmentComponent,
				...passAlong
			});
			// case 'page':
		default: // Since componentType is undefined when using automatic page templates, we have to assume it's a page.
			return this.processPage({
				component: component as PageComponent,
				...passAlong
			});
			// throw new Error(`processComponents: component type not supported: ${componentType}!`);
		}
	}
} // class DataFetcher
