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
import {LayoutData, PageData, XpRunMode, ComponentDataAndProps, ComponentData, TextData} from '@enonic/react-components/dist/nashorn';
import type {ContextParams} from '@enonic-types/lib-context';


import {get as getContentByKey} from '/lib/xp/content';
import {getContent as getCurrentContent, sanitizeHtml} from '/lib/xp/portal';
import {IS_DEV_MODE} from '/lib/enonic/react4xp/xp/appHelper';

import {processHtml} from '/lib/enonic/react4xp/dataFetcher/processHtml';
import type {RegionsData, MacroData} from '@enonic/react-components';

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
	dataFetcher: DataFetcher;
	request: Request;
	component?: Component<DESCRIPTOR>;
	runMode: XpRunMode,
	content: PageContent;
}, OVERRIDES>

export type ComponentProcessor<
	DESCRIPTOR extends ComponentDescriptor = ComponentDescriptor,
	OVERRIDES extends Record<string, unknown> = Record<string, never>
> = (params: ComponentProcessorParams<DESCRIPTOR, OVERRIDES>) => Record<string, unknown>;

export type MacroProcessorParams = Record<string, unknown> & {
	macro: MacroData;
}

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

export type ProcessResult<T extends ComponentData = ComponentData> = ComponentDataAndProps<T> & {
	common?: Record<string, unknown>;
	meta: MetaData;
}

const RUN_MODE = IS_DEV_MODE ? 'development' : 'production';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ADMIN_CONTEXT: ContextParams = {
	principals: ['role:system.schema.admin']
}

export class DataFetcher {
	private content: PageContent;
	private common: ComponentProcessor<PageDescriptor>;
	private contentTypes: Record<PageDescriptor, ComponentProcessor<PageDescriptor>> = {};
	private layouts: Record<LayoutDescriptor, ComponentProcessor<LayoutDescriptor>> = {};
	private pages: Record<PageDescriptor, ComponentProcessor<PageDescriptor>> = {};
	private parts: Record<PartDescriptor, ComponentProcessor<PartDescriptor>> = {};
	private macros: Record<string, ComponentProcessor> = {};
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

	invokeProcessor(
		result: ComponentDataAndProps,
		processor: ComponentProcessor,
		passAlong: Record<string, unknown>,
		component?: Component,
		dataField: 'data' | 'common' = 'data'
	): ComponentDataAndProps {

		try {
			result[dataField] = processor({
				...passAlong,
				dataFetcher: this,
				component,
				content: this.content,
				request: this.request,
				runMode: RUN_MODE,
			});
		} catch (err) {
			let path = this.content._path;
			let msg = '';
			if (dataField === 'common') {
				msg = `Error in common processor at: ${path}`;
			}
			if (dataField === 'data' && component) {
				let descriptor = this.content.type;
				switch (component?.type) {
				case 'text':
					// happens when processing macros in text component
					// in this case we pass 'macro' component in passAlong
					// because it can not be passed as a regular component
					path = component.path;
					const macroData = passAlong['macro'] as MacroData;
					descriptor = macroData.descriptor
					break;
				case 'layout':
				case 'part':
				case 'page':
					path = component.path;
					descriptor = component.descriptor;
					break;
				}
				msg = `Error in processor for ${result.component.type} "${descriptor}" at: ${path}`;
			}
			log.error(msg);
			result.component = {
				html: `<h1>Error</h1><p>${msg}</p>${err.message && `<pre>${sanitizeHtml(err.message)}</pre>`}`,
				type: 'error',
				path
			}
		}
		return result;
	}

	private processContentType({
								   contentType,
								   ...passAlong
							   }: {
								   [key: string]: unknown
								   contentType: string
							   }
	): ComponentDataAndProps {
		const processor = this.contentTypes[contentType];

		const result: ComponentDataAndProps = {
			component: {
				contentType,
				type: 'contentType',
			},
		}

		return this.invokeProcessor(result, processor, passAlong);
	}

	private processFragment({
								component,
								...passAlong
							}: {
								component: FragmentComponent;
							}
	): ComponentDataAndProps {
		// log.debug('dataFetcher.processFragment passAlong:%s', toStr(passAlong));
		const {
			fragment: key,
			path
		} = component;
		// log.info('processFragment fragment key:', key);

		if (!key) {
			// Key can be undefined until fragment is initialized
			log.debug(`DataFetcher: processFragment: No key for fragment [${path}] at: ${this.content._path}`);
			return {
				component: {
					path,
					type: 'fragment'
				}
			};
		}

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
						  }
	): ComponentDataAndProps {
		// log.debug('dataFetcher.processLayout passAlong:%s', toStr(passAlong));
		const {
			descriptor,
			path,
			regions
		} = component;

		const LayoutData: LayoutData = {
			// Do not ass config, it should not be exposed to client-side
			descriptor,
			path,
			regions: JSON.parse(JSON.stringify(regions || {})), // TODO config should be stripped from child components?
			type: 'layout',
		};


		let result: ComponentDataAndProps = {
			component: LayoutData,
		}

		if (!descriptor) {
			// Descriptor can be undefined until layout is initialized
			log.debug(`DataFetcher: processLayout: No descriptor for layout [${path}] at: ${this.content._path}`);
			return result;
		}

		LayoutData.regions = this.processRegions(component);

		const processor = this.layouts[descriptor];
		if (processor) {
			const layoutWithRegionsData = JSON.parse(JSON.stringify(component));
			if (Object.keys(LayoutData.regions)?.length) {
				layoutWithRegionsData.regions = JSON.parse(JSON.stringify(LayoutData.regions));
			}

			result = this.invokeProcessor(result, processor, passAlong, layoutWithRegionsData);
		}

		return result;
	} // processLayout

	private processPage({
							component,
							...passAlong
						}: {
							component: PageComponent;
						}
	): ComponentDataAndProps {

		const {
			descriptor,
			path, // Should always be '/'
			regions, // CAUTION: Is undefined when using page templates.
		} = component;
		// log.debug('processPage: regions:%s', toStr(regions));

		const pageData: PageData = {
			// WARNING: Do NOT pass config, it should not be exposed to client-side.
			descriptor,
			path,
			regions: JSON.parse(JSON.stringify(regions || {})), // TODO config should be stripped from child components?
			type: 'page',
		};

		let result: ComponentDataAndProps = {
			component: pageData,
		}

		if (!descriptor) {
			// Descriptor can be undefined until page is initialized
			log.debug(`DataFetcher: processPage: No descriptor for page at: ${this.content._path}`);
			return result;
		}

		pageData.regions = this.processRegions(component);

		const processor = this.pages[descriptor];
		if (processor) {
			const pageWithRegionsData = JSON.parse(JSON.stringify(component));
			if (Object.keys(pageData.regions)?.length) {
				pageWithRegionsData.regions = JSON.parse(JSON.stringify(pageData.regions));
			}

			result = this.invokeProcessor(result, processor, passAlong, pageWithRegionsData);
		}

		return result;
	} // processPage

	private processPart({
							component,
							...passAlong
						}: {
							component: PartComponent;
						}
	): ComponentDataAndProps {
		// log.debug('dataFetcher.processPart passAlong:%s', toStr(passAlong));
		const {
			descriptor,
			path,
		} = component;

		let result: ComponentDataAndProps = {
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
			const partClone = JSON.parse(JSON.stringify(component));
			result = this.invokeProcessor(result, processor, passAlong, partClone);
		}

		return result;
	} // processPart

	private processTextComponent({
									 component,
									 ...passAlong
								 }: {
		component: TextComponent
	}): ComponentDataAndProps<TextData> {
		const {text} = component;

		const richTextData = processHtml({
			...passAlong,
			value: text,
			dataFetcher: this,
			component,
		});
		// log.debug('processTextComponent text renderableTextComponent:%s', toStr(renderableTextComponent));
		return {
			component: JSON.parse(JSON.stringify(component)),
			data: {
				data: richTextData
			}
		};
	}

	private processRegions(component: PageComponent | LayoutComponent): RegionsData {

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
		// log.debug('processWithRegions regions:', stringify(LayoutDataOrPageComponent.regions, {maxItems: Infinity}));
		return regions;
	} // processRegions

	public addContentType<
		OVERRIDES extends Record<string, unknown> = Record<string, never>,
		PAGE_DESCRIPTOR extends PageDescriptor = PageDescriptor,
	>(contentTypeName: string, {
		processor
	}: {
		processor: ComponentProcessor<PAGE_DESCRIPTOR, OVERRIDES>;
	}) {
		this.contentTypes[contentTypeName] = processor // as PageComponentProcessorFunction;
	}

	public addLayout<
		OVERRIDES extends Record<string, unknown> = Record<string, never>,
		LAYOUT_DESCRIPTOR extends LayoutDescriptor = LayoutDescriptor,
	>(descriptor: LAYOUT_DESCRIPTOR, {
		processor
	}: {
		processor: ComponentProcessor<LAYOUT_DESCRIPTOR, OVERRIDES>;
	}) {
		// log.debug('addLayout:', descriptor);
		this.layouts[descriptor] = processor as ComponentProcessor<LAYOUT_DESCRIPTOR>;
	}

	public addPage<
		OVERRIDES extends Record<string, unknown> = Record<string, never>,
		PAGE_DESCRIPTOR extends PageDescriptor = PageDescriptor,
	>(descriptor: PAGE_DESCRIPTOR, {
		processor
	}: {
		processor: ComponentProcessor<PAGE_DESCRIPTOR, OVERRIDES>;
	}) {
		// log.debug('addPage:', descriptor);
		this.pages[descriptor] = processor as ComponentProcessor<PAGE_DESCRIPTOR>;
	}

	public addPart<
		OVERRIDES extends Record<string, unknown> = Record<string, never>,
		PART_DESCRIPTOR extends PartDescriptor = PartDescriptor // gotten from the passed descriptor parameter below
	>(descriptor: PART_DESCRIPTOR, {
		processor
	}: {
		processor: ComponentProcessor<PART_DESCRIPTOR, OVERRIDES>;
	}) {
		// log.debug('addPart:', descriptor);
		this.parts[descriptor] = processor as ComponentProcessor<PART_DESCRIPTOR>;
	}

	public addMacro<
		OVERRIDES extends Record<string, unknown> = Record<string, never>,
		MACRO_DESCRIPTOR extends ComponentDescriptor = ComponentDescriptor //
	>(descriptor: string, {
		processor
	}: {
		processor: ComponentProcessor<ComponentDescriptor, OVERRIDES>;
	}) {
		// log.debug('addMacro:', descriptor);
		this.macros[descriptor] = processor as ComponentProcessor<MACRO_DESCRIPTOR>;
	}

	public addCommon<
		OVERRIDES extends Record<string, unknown> = Record<string, never>,
		PAGE_DESCRIPTOR extends PageDescriptor = PageDescriptor,
	>({
		  processor
	  }: {
		processor: ComponentProcessor<PAGE_DESCRIPTOR, OVERRIDES>
	}) {

		this.common = processor as ComponentProcessor<PageDescriptor>;
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

	public hasMacro(name: string): boolean {
		return this.macros[name] !== undefined
	}

	public getMacro(descriptor: string): ComponentProcessor {
		return this.macros[descriptor];
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

		let result = this.doProcess({
			...passAlong,
			component,
		});

		if (result.component.type !== 'error' && this.hasCommon()) {
			result = this.invokeProcessor(result, this.common.bind(this), passAlong, component, 'common');
		}

		const meta = this.createMetaData(request, content);

		return {
			...result,
			meta
		};
	}

	private doProcess({
						  component,
						  ...passAlong
					  }: {
						  [key: string]: unknown;
						  component: Component;
					  }
	): ComponentDataAndProps {

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
