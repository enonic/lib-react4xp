import {
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
	ComponentDescriptor,
	LiteralUnion,
	RequestMode
} from '@enonic-types/core';
import {
	ProcessedData,
	ProcessedLayout,
	ProcessedPage,
	ProcessedText,
	XpRunMode,
	ProcessedProps
} from '@enonic/react-components/dist/nashorn';
import type {ContextParams} from '@enonic-types/lib-context';


import {get as getContentByKey} from '/lib/xp/content';
import {getContent as getCurrentContent} from '/lib/xp/portal';
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

export type MetaData = {
	type: string;
	id: string;
	path: string;
	mode: LiteralUnion<RequestMode>;
}

export type ProcessResult = ProcessedData & {
	common?: ProcessedProps;
	meta: MetaData;
}

const RUN_MODE = IS_DEV_MODE ? 'development' : 'production';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ADMIN_CONTEXT: ContextParams = {
	principals: ['role:system.schema.admin']
}

export class DataFetcher {
	private content: PageContent;
	private common: ComponentProcessorFunction<PageDescriptor>;
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

	private createMetaData(request: Request, content: Content): MetaData {

		return {
			type: content.type,
			id: content._id,
			path: content._path,
			mode: request.mode,
		}
	}

	private processContentType({
								   contentType,
								   ...passAlong
							   }: {
								   [key: string]: unknown
								   contentType: string
							   }
	): ProcessedData {
		const processor = this.contentTypes[contentType];

		const data = processor({
			...passAlong,
			content: this.content,
			request: this.request,
			runMode: RUN_MODE,
		});

		return {
			// WARNING: Do NOT pass config, it should not be exposed to client-side hydration.
			component: {
				contentType,
				type: 'contentType',
			},
			data,
		};
	}

	private processFragment({
								component,
								...passAlong
							}: {
								component: FragmentComponent;
								siteConfig?: Record<string, unknown> | null; // In passAlong
							}
	): ProcessedData {
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

			return {
				component: {
					html: `<h1>Error</h1><p>Fragment content NOT found for key:${key}</p>`,
					path,
					type: 'error'
				}
			}
		}
		// log.info('processFragment content:', content);

		const {fragment} = fragmentContent;
		if (!fragment) {
			// This probably never happens, only if content is b0rked:
			log.error(`DataFetcher: processFragment: B0rked Fragment content key:%s! Referenced in content:%s componentPath:%s`, key,
				this.content._id, path);

			return {
				component: {
					html: `<h1>Error</h1><p>Fragment NOT found in content with key:${key}</p>`,
					path,
					type: 'error'
				}
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
						  }
	): ProcessedData {
		// log.debug('dataFetcher.processLayout passAlong:%s', toStr(passAlong));
		const {
			descriptor,
			path,
			regions
		} = component;

		const processedLayout: ProcessedLayout = {
			// Do not ass config, it should not be exposed to client-side
			descriptor,
			path,
			regions: JSON.parse(JSON.stringify(regions || {})), // TODO config should be stripped from child components?
			type: 'layout',
		};


		const result: ProcessedData = {
			component: processedLayout,
		}

		if (!descriptor) {
			// Descriptor can be undefined until layout is initialized
			log.debug(`DataFetcher: processLayout: No descriptor for layout [${path}] at: ${this.content._path}`);
			return result;
		}

		processedLayout.regions = this.processRegions(component);

		const processor = this.layouts[descriptor];
		if (processor) {

			const layoutWithProcessedRegions = JSON.parse(JSON.stringify(component));
			if (Object.keys(processedLayout.regions)?.length) {
				layoutWithProcessedRegions.regions = JSON.parse(JSON.stringify(processedLayout.regions));
			}

			result.data = processor({
				...passAlong,
				component: layoutWithProcessedRegions,
				content: this.content,
				request: this.request,
				runMode: RUN_MODE,
			});
		}

		return result;
	} // processLayout

	private processPage({
							component,
							...passAlong
						}: {
							component: PageComponent;
							siteConfig?: Record<string, unknown> | null; // In passAlong
						}
	): ProcessedData {

		const {
			descriptor,
			path, // Should always be '/'
			regions, // CAUTION: Is undefined when using page templates.
		} = component;
		// log.debug('processPage: regions:%s', toStr(regions));

		const processedPage: ProcessedPage = {
			// WARNING: Do NOT pass config, it should not be exposed to client-side.
			descriptor,
			path,
			regions: JSON.parse(JSON.stringify(regions || {})), // TODO config should be stripped from child components?
			type: 'page',
		};

		const result: ProcessedData = {
			component: processedPage,
		}

		if (!descriptor) {
			// Descriptor can be undefined until page is initialized
			log.debug(`DataFetcher: processPage: No descriptor for page at: ${this.content._path}`);
			return result;
		}

		processedPage.regions = this.processRegions(component);

		const processor = this.pages[descriptor];
		if (processor) {
			const pageWithProcessedRegions = JSON.parse(JSON.stringify(component));
			if (Object.keys(processedPage.regions)?.length) {
				pageWithProcessedRegions.regions = JSON.parse(JSON.stringify(processedPage.regions));
			}

			result.data = processor({
				...passAlong,
				component: pageWithProcessedRegions,
				content: this.content,
				request: this.request,
				runMode: RUN_MODE,
			});
		}

		return result;
	} // processPage

	private processPart({
							component,
							...passAlong
						}: {
							component: PartComponent;
							siteConfig?: Record<string, unknown> | null; // In passAlong
						}
	): ProcessedData {
		// log.debug('dataFetcher.processPart passAlong:%s', toStr(passAlong));
		const {
			descriptor,
			path
		} = component;

		const result: ProcessedData = {
			component: {
				descriptor,
				path,
				type: 'part',
			}
		}

		if (!descriptor) {
			// Descriptor can be undefined until part is initialized
			log.debug(`DataFetcher: processPart: No descriptor for part [${path}] at: ${this.content._path}`);
			return result;
		}

		const processor = this.parts[descriptor];
		if (processor) {
			result.data = processor({
				...passAlong,
				component: JSON.parse(JSON.stringify(component)),
				content: this.content,
				request: this.request,
				runMode: RUN_MODE,
			});
		}

		return result;
	} // processPart

	private processTextComponent({
									 component,
								 }: {
		component: TextComponent
	}): ProcessedData {
		const {text} = component;
		const renderableTextComponent: ProcessedText = JSON.parse(JSON.stringify(component));

		const data = {
			data: processHtml(text)
		};
		// log.debug('processTextComponent text renderableTextComponent:%s', toStr(renderableTextComponent));
		return {
			component: renderableTextComponent,
			data
		};
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
				const processedComponent = this.doProcess({
					component: origComponent,
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

	public addCommon<
		OVERRIDES extends Record<string, unknown> = Record<string, never>,
		PAGE_DESCRIPTOR extends PageDescriptor = PageDescriptor,
	>({
		  processor
	  }: {
		processor: ComponentProcessorFunction<PAGE_DESCRIPTOR, OVERRIDES>
	}) {

		this.common = processor as ComponentProcessorFunction<PageDescriptor>;
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

	public hasCommon(): boolean {
		return !!this.common;
	}

	public process({
					   component,
					   content,
					   request,
					   ...passAlong
				   }: ProcessParams
	): ProcessResult {

		if (!request) {
			throw new Error(`process: request is required!`);
		}
		this.request = request;
		// log.debug('dataFetcher.process passAlong:%s', toStr(passAlong));
		// content = this.getCurrentContent && this.getCurrentContent() as PageContent
		if (!content) {
			content = getCurrentContent!() as PageContent;
			if (!content) {
				log.error(`process: content not passed and getCurrentContent returned null!`);
				throw new Error(`process: could not get content!`);
			}
		}
		this.content = content;

		if (!component) {
			component = (this.content.page || this.content.fragment) as Component;
			if (!component) {
				log.error(`process: component not passed and neither content.page nor content.fragment is found!`);
				throw new Error(`process: could not get component!`);
			}
		}

		const pData = this.doProcess({
			...passAlong,
			component,
		});

		let common: ProcessedProps;
		if (this.hasCommon()) {
			common = this.common({
				...passAlong,
				component,
				content,
				request,
				runMode: RUN_MODE,
			});
		}

		return {
			...pData,
			meta: this.createMetaData(request, content),
			common,
		};
	}

	private doProcess({
						  component,
						  ...passAlong
					  }: {
						  [key: string]: unknown;
						  component: Component;
					  }
	): ProcessedData {

		// const { method } = request;
		const {type: contentType} = this.content;

		// if (method === REQUEST_METHOD.HEAD) {}

		if (this.hasContentType(contentType)) {
			return this.processContentType({
				...passAlong,
				contentType,
			});
		}

		const {
			type: componentType // CAUTION: Is undefined when using page templates.
		} = component;

		switch (componentType) {
		case 'part':
			return this.processPart({
				component: component as PartComponent,
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
