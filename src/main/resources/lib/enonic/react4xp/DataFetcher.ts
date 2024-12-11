import type {
	Component,
	Content,
	FragmentComponent,
	// Layout,
	LayoutComponent,
	LayoutDescriptor,
	Merge,
	// Page,
	PageComponent,
	PageComponentWhenAutomaticTemplate,
	PageComponentWhenSpecificTemplate,
	PageDescriptor,
	// Part,
	PartComponent,
	PartDescriptor,
	Request,
	Response,
	TextComponent,
} from '@enonic-types/core';
import type {
	// GetDynamicComponentParams,
	FormItem,
	FormItemOptionSet,
	FormItemSet,
	MixinSchema,
} from '@enonic-types/lib-schema';
import type {
	RenderableComponent,
	RenderableContentType,
	RenderableError,
	RenderableLayoutComponent,
	RenderablePageComponent,
	RenderablePartComponent,
	RenderableTextComponent,
	RenderableWarning,
	XpRunMode,
} from '@enonic/react-components/nashorn';


import {getIn} from '@enonic/js-utils/object/getIn';
import {setIn} from '@enonic/js-utils/object/setIn';
import {toStr} from '@enonic/js-utils/value/toStr';
// import {stringify} from 'q-i';

import {
	get as getContentByKey
} from '/lib/xp/content';
import {
	getComponent as getComponentSchema,
	listSchemas
} from '/lib/xp/schema';
import {
	getContent as getCurrentContent,
	processHtml,
	// pageUrl as getPageUrl,
} from '/lib/xp/portal';
import {
	REQUEST_METHOD,
	REQUEST_MODE,
} from '/lib/enonic/react4xp/constants';
import { IS_DEV_MODE } from '/lib/enonic/react4xp/xp/appHelper';
import { getCachedPageComponentFromContentType } from '/lib/enonic/react4xp/pageTemplate/getCachedPageComponentFromContentType';
import { getCachedPageComponentFromPageTemplateContentId } from '/lib/enonic/react4xp/pageTemplate/getCachedPageComponentFromPageTemplateContentId';

import { dataFromProcessedHtml } from './dataFetcher/dataFromProcessedHtml';

export interface ContentTypeProcessorParams<
	CONTENT extends Content = PageContent,
	PAGE_DESCRIPTOR extends PageDescriptor = PageDescriptor
> {
	component?: ProcessedPageComponent<PAGE_DESCRIPTOR>;
	content?: CONTENT;
	siteConfig?: Record<string, unknown> | null; // In passAlong
	request: Request;
	runMode: XpRunMode,
}

export type ContentTypeProcessorFunction<
	CONTENT extends Content = PageContent,
	PAGE_DESCRIPTOR extends PageDescriptor = PageDescriptor
> = (params: ContentTypeProcessorParams<CONTENT, PAGE_DESCRIPTOR>) => ProcessorResult;

export type FragmentContent<
	// Component extends LayoutComponent | PartComponent = Layout | Part
	Component extends LayoutComponent | PartComponent = LayoutComponent | PartComponent
> = Content<undefined,'portal:fragment',Component>;

export type NestedPartial<T> = {
	[K in keyof T]?: T[K] extends object ? NestedPartial<T[K]> : T[K];
};
export interface GetComponentReturnType {
	componentPath: string;
	config: Record<string, unknown>;
	description?: string;
	descriptionI18nKey?: string;
	displayName: string;
	displayNameI18nKey: string;
	form: NestedPartial<FormItem>[];
	key: string;
	modifiedTime: string;
	regions?: string[];
	resource: string;
	type: 'PART' | 'LAYOUT' | 'PAGE';
};
// type GetComponent = (params: GetDynamicComponentParams) => GetComponentReturnType;

export type LayoutComponentProcessorParams<
	LAYOUT_DESCRIPTOR extends LayoutDescriptor = LayoutDescriptor,
	OVERRIDES extends Record<string, unknown> = Record<string, never>
> = Merge<{
	component: ProcessedLayoutComponent<LAYOUT_DESCRIPTOR>;
	content?: PageContent;
	siteConfig?: Record<string, unknown> | null; // In passAlong
	request: Request;
	runMode: XpRunMode,
}, OVERRIDES>

export type PageComponentProcessorParams<
	PAGE_DESCRIPTOR extends PageDescriptor = PageDescriptor,
	T = Record<string, never>
> = Merge<{
	component: ProcessedPageComponent<PAGE_DESCRIPTOR>;
	content?: PageContent;
	siteConfig?: Record<string, unknown> | null; // In passAlong
	request: Request;
	runMode: XpRunMode,
}, T>

export type PageContent<
	Data = Record<string, unknown>,
	Type extends string = string,
	// Component extends PageComponent = Page
	Component extends PageComponent = PageComponent
> = Content<
	Data,
	Type,
	// @ts-expect-error Does not satisfy the type constraint
	Component
>

export type PartComponentProcessorParams<
	PART_DESCRIPTOR extends PartDescriptor = PartDescriptor,
	OVERRIDES extends Record<string, unknown> = Record<string, never>
> = Merge<{
	component: PartComponent<PART_DESCRIPTOR>;
	content?: PageContent;
	siteConfig?: Record<string, unknown> | null; // In passAlong
	request: Request;
	runMode: XpRunMode;
}, OVERRIDES>

export type LayoutComponentProcessorFunction<
	LAYOUT_DESCRIPTOR extends LayoutDescriptor = LayoutDescriptor,
	OVERRIDES extends Record<string, unknown> = Record<string, never>
> = (params: LayoutComponentProcessorParams<LAYOUT_DESCRIPTOR, OVERRIDES>) => ProcessorResult;

export type PageComponentProcessorFunction<
	PAGE_DESCRIPTOR extends PageDescriptor = PageDescriptor,
	OVERRIDES extends Record<string, unknown> = Record<string, never>
> = (params: PageComponentProcessorParams<PAGE_DESCRIPTOR, OVERRIDES>) => ProcessorResult;

export type PartComponentProcessorFunction<
	PART_DESCRIPTOR extends PartDescriptor = PartDescriptor,
	OVERRIDES extends Record<string, unknown> = Record<string, never>
> = (params: PartComponentProcessorParams<PART_DESCRIPTOR, OVERRIDES>) => ProcessorResult;

interface ProcessParams {
	[passAlongKey: string]: unknown;
	component?: Component | PageComponentWhenSpecificTemplate | PageComponentWhenAutomaticTemplate;
	content?: PageContent;
	request: Request;
}

export interface ProcessResult<
	COMPONENT extends RenderableComponent = RenderableComponent
> {
	component?: COMPONENT;
	response?: Response;
}

export interface ProcessorResult {
	response?: Response;
	props?: Record<string, unknown>;
}

export type ProcessedLayoutComponent<
	LAYOUT_DESCRIPTOR extends LayoutDescriptor = LayoutDescriptor
> = LayoutComponent<LAYOUT_DESCRIPTOR> & {
	props?: Record<string, unknown>;
}
export type ProcessedPageComponent<
	PAGE_DESCRIPTOR extends PageDescriptor = PageDescriptor
> = PageComponent<PAGE_DESCRIPTOR> & {
	props?: Record<string, unknown>;
}
export type ProcessedPartComponent<
	PART_DESCRIPTOR extends PartDescriptor = PartDescriptor
> = PartComponent<PART_DESCRIPTOR> & {
	props?: Record<string, unknown>;
}

export type ShortcutContent = Content<{
	parameters: {
		name: string;
		value: string;
	}[];
	target: string;
}, 'base:shortcut'>;

const RUN_MODE = IS_DEV_MODE ? 'development' : 'production';

export class DataFetcher {
	private content: PageContent;
	private contentTypes: Record<PageDescriptor, PageComponentProcessorFunction> = {};
	private layouts: Record<LayoutDescriptor, LayoutComponentProcessorFunction> = {};
	private mixinSchemas: Record<string, MixinSchema> = {}
	private pages: Record<PageDescriptor, PageComponentProcessorFunction> = {};
	private parts: Record<PartDescriptor, PartComponentProcessorFunction> = {};
	private request: Request;

	private static getPath(name: string, ancestor?: string) {
		return ancestor ? `${ancestor}.${name}` : name;
	}

	constructor() {}

	private findHtmlAreasInFormItemArray({
		ancestor,
		form,
		htmlAreas, // get modified
	}: {
		ancestor?: string;
		form:  NestedPartial<FormItem>[];
		htmlAreas: string[];
	}) {
		for (let i = 0; i < form.length; i++) {
			const formItem = form[i];
			const {
				formItemType,
				name
			} = formItem;
			if (formItemType === 'Input') {
				const {inputType} = formItem;
				if (inputType === 'HtmlArea') {
					htmlAreas.push(DataFetcher.getPath(name as string, ancestor));
				}
			} else if (formItemType === 'ItemSet') {
				const {items} = formItem as FormItemSet;
				this.findHtmlAreasInFormItemArray({ // recurse
					ancestor: DataFetcher.getPath(name as string, ancestor),
					form: items as NestedPartial<FormItem>[],
					htmlAreas, // get modified
				});
			} else if (formItemType === 'OptionSet') {
				const {options} = formItem as FormItemOptionSet;
				for (let j = 0; j < options.length; j++) {
					const option = options[j];
					const {
						name: optionName,
						items
					} = option;
					this.findHtmlAreasInFormItemArray({ // recurse
						ancestor: DataFetcher.getPath(`${name}.${j}.${optionName}`, ancestor),
						form: items as NestedPartial<FormItem>[],
						htmlAreas, // get modified
					});
					// log.info('findHtmlAreasInFormItemArray OptionSet htmlAreas', htmlAreas);
				}
			} else if (formItemType === 'InlineMixin') {
				if (!name) {
					throw new Error(`findHtmlAreasInFormItemArray: InlineMixin name not found!`);
				}
				let mixin = this.mixinSchemas[name];

				if (!mixin) {
					const [application] = name.split(':');
					const mixinsList = listSchemas({
						application,
						type: 'MIXIN'
					}) as MixinSchema[];
					// log.debug('findHtmlAreasInFormItemArray mixinsList', mixinsList);

					for (let j = 0; j < mixinsList.length; j++) {
						const mixin = mixinsList[j];
						const {name: mixinName} = mixin;
						this.mixinSchemas[mixinName] = mixin;
					}
					// log.debug('findHtmlAreasInFormItemArray multiAppMixinsObj', multiAppMixinsObj);
					mixin = this.mixinSchemas[name];
					if (!mixin) {
						throw new Error(`findHtmlAreasInFormItemArray: InlineMixin mixin not found for name: ${name}!`);
					}
					// log.debug('findHtmlAreasInFormItemArray mixin', mixin);
				}

				const {form} = mixin;
				if (!form) {
					throw new Error(`findHtmlAreasInFormItemArray: InlineMixin mixin form not found for name: ${name}!`);
				}
				// log.debug('findHtmlAreasInFormItemArray form', form);

				this.findHtmlAreasInFormItemArray({ // recurse
					ancestor,
					form: form,
					htmlAreas, // get modified
				});
			} else if (formItemType === 'Layout') {
				// log.debug('findHtmlAreasInFormItemArray Layout formItem', formItem);
				const {items} = formItem;
				if (items) { // Avoid empty fieldsets
					this.findHtmlAreasInFormItemArray({ // recurse
						ancestor,
						form: items as NestedPartial<FormItem>[],
						htmlAreas, // get modified
					});
				}
			}
		}
		// log.info('findHtmlAreasInFormItemArray htmlAreas', htmlAreas);
	}

	private getHtmlAreas({
		ancestor,
		form,
	}: {
		ancestor?: string;
		form: NestedPartial<FormItem>[];
	}): string[] {
		const htmlAreas: string[] = [];
		this.findHtmlAreasInFormItemArray({
			ancestor,
			form,
			htmlAreas,
		});
		// log.info('getHtmlAreas htmlAreas', htmlAreas);
		return htmlAreas;
	}

	private processContentType({
		contentType,
		...passAlong
	}: {
		[key: string]: unknown
		contentType: string
	}): ProcessResult<RenderableContentType> {
		const processor = this.contentTypes[contentType];

		const {
			props,
			response,
		} = processor({
			...passAlong,
			content: this.content,
			request: this.request,
			runMode: RUN_MODE,
		});

		if (response) {
			return { response };
		}

		const renderableContentType: RenderableContentType = {
			// WARNING: Do NOT pass config, it should not be exposed to client-side hydration.
			contentType,
			mode: this.request.mode,
			props,
			type: 'contentType',
		};

		return {
			component: renderableContentType
		};
	}

	private processFragment({
		component,
		...passAlong
	}: {
		component: FragmentComponent;
		siteConfig?: Record<string, unknown> | null; // In passAlong
	}): ProcessResult<RenderablePartComponent | RenderableLayoutComponent | RenderableTextComponent | RenderableError> {
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
			log.error(`DataFetcher: processFragment: Fragment content NOT found for key:%s! Referenced in content:%s componentPath:%s`, key, this.content._id, path);

			if (this.request.mode === REQUEST_MODE.LIVE) {
				return {
					response: {
						status: 500
					}
				};
			}

			return {
				component: {
					html: `<h1>Error</h1><p>Fragment content NOT found for key:${key}</p>`,
					mode: this.request.mode,
					path,
					type: 'error'
				}
			}
		}
		// log.info('processFragment content:', content);

		const {fragment} = fragmentContent;
		if (!fragment) {
			// This probably never happens, only if content is b0rked:
			log.error(`DataFetcher: processFragment: B0rked Fragment content key:%s! Referenced in content:%s componentPath:%s`, key, this.content._id, path);

			if (this.request.mode === REQUEST_MODE.LIVE) {
				return {
					response: {
						status: 500
					}
				};
			}

			return {
				component: {
					html: `<h1>Error</h1><p>Fragment NOT found in content with key:${key}</p>`,
					mode: this.request.mode,
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

		if(type === 'part') {
			return this.processPart({
				component: fragment,
				...passAlong
			});
		}
		if(type === 'layout') {
			return this.processLayout({
				component: fragment,
				...passAlong
			});
		}
		if(type === 'text') {
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
	}): ProcessResult<RenderableLayoutComponent> {
		// log.debug('dataFetcher.processLayout passAlong:%s', toStr(passAlong));
		const {
			descriptor,
			path,
			regions
		} = component;
		const renderableComponent: RenderableLayoutComponent = {
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
			renderableComponent.warning = msg;
			return {
				component: renderableComponent
			};
		}

		const {form} = getComponentSchema({
			key: descriptor,
			type: 'LAYOUT',
		}) as GetComponentReturnType;

		const processedLayoutComponent = this.processWithRegions({
			component,
			form,
		}) as ProcessedLayoutComponent;
		// log.info('DataFetcher processLayout processedLayoutComponent:%s', toStr(processedLayoutComponent))

		const processorResult = processor({
			...passAlong,
			component: processedLayoutComponent,
			content: this.content,
			request: this.request,
			runMode: RUN_MODE,
		});
		const {
			props,
			response,
		} = processorResult;
		if (response) {
			return { response };
		}
		renderableComponent.props = props;
		return {
			component: renderableComponent
		};
	} // processLayout

	private processPage({
		component,
		...passAlong
	}: {
		component: PageComponent | PageComponentWhenSpecificTemplate | PageComponentWhenAutomaticTemplate;
		siteConfig?: Record<string, unknown> | null; // In passAlong
	}): ProcessResult<RenderablePageComponent | RenderableWarning> {
		// log.debug('processPage component:', component);
		// log.debug('dataFetcher.processPage passAlong:%s', toStr(passAlong));

		if (!component['descriptor']) { // No local page component, check page templates:
			const pageTemplateContentId = component['pageTemplateContentId'];
			// const componentType = component['type']; // Is undefined when automatic page templage.
			if (!pageTemplateContentId) { // Page Template: Automatic
				const {type: contentType} = this.content;
				if (!contentType) {
					throw new Error(`processPage: Unable to determine descriptor! Both component.descriptor and content.type are missing!`);
				}
				// log.debug('processPage: No component.descriptor. contentType:%s', contentType);
				try {
					component = getCachedPageComponentFromContentType({ contentType });
				} catch (e) {
					if (
						this.request.params['mode'] === REQUEST_MODE.EDIT
						&& this.request.mode === REQUEST_MODE.INLINE
						&& this.request.method === REQUEST_METHOD.HEAD
					) {
						return {
							response: {
								// So Content Studio knowns the page is NOT renderable,
								// and the page selector dropdown is shown.
								status: 418
							}
						};
					}
					return {
						component: <RenderableWarning>{
							mode: this.request.mode,
							path: '/',
							type: 'warning',
							html: `<h1>Not renderable</h1>
<p>Please do one of the following:</p>
<ul>
	<li>Setup a page template that supports content-type: "${contentType}".</li>
	<li>Edit the page and select a Page Component.</li>
	<li>Add special handling for content-type: "${contentType}" in DataFetcher.</li>
</ul>`,
						}
					};
				}

				// log.debug('processPage: No component.descriptor. contentType:%s component(from page template):%s', contentType, toStr(component));
			} else { // Page Template: Specific
				// log.debug('processPage: No descriptor. componentType:%s pageTemplateContentId:%s', componentType, pageTemplateContentId);
				try {
					component = getCachedPageComponentFromPageTemplateContentId({pageTemplateContentId});
				// log.debug('processPage: No descriptor. componentType:%s pageTemplateContentId:%s component(from page template):%s', componentType, pageTemplateContentId, toStr(component));
				} catch (e) {
					if (
						this.request.mode === REQUEST_MODE.INLINE
						&& this.request.method === REQUEST_METHOD.HEAD
						&& this.request.params['mode'] === REQUEST_MODE.EDIT
					) {
						return {
							response: {
								// So Content Studio knowns the page is NOT renderable,
								// and the page selector dropdown is shown.
								status: 418
							}
						};
					}
					return {
						component: {
							descriptor: 'unknown:unknown', // This might end up as: Page descriptor:unknown:unknown not registered in ComponentRegistry!
							error: e.message,
							mode: this.request.mode,
							path: '/',
							regions: {},
							type: 'page',
						}
					};
				}
			}
		}

		const {
			descriptor,
			path, // Should always be '/'
			regions, // CAUTION: Is undefined when using page templates.
		} = component as PageComponent;
		// log.debug('processPage: regions:%s', toStr(regions));

		if (!descriptor) { // This could probably only happen on b0rked template content, or some caching mistake.
			log.error(`processPage: descriptor not found for page component: ${toStr(component)} in content:${toStr(this.content)}!`);
			throw new Error(`processPage: descriptor not found for page component!`);
		}

		const renderableComponent: RenderablePageComponent = {
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
			renderableComponent.warning = msg;
			return {
				component: renderableComponent
			};
		}

		const {form} = getComponentSchema({
			key: descriptor,
			type: 'PAGE',
		}) as GetComponentReturnType;

		const processedPageComponent = this.processWithRegions({
			component,
			form,
		}) as ProcessedPageComponent;
		// log.info('DataFetcher processPage processedPageComponent:%s', toStr(processedPageComponent));

		const processorResult = processor({
			...passAlong,
			component: processedPageComponent,
			content: this.content,
			request: this.request,
			runMode: RUN_MODE,
		});
		const {
			props,
			response,
		} = processorResult;
		if (response) {
			return { response };
		}
		renderableComponent.props = props;
		return {
			component: renderableComponent
		};
	} // processPage

	private processPart({
		component,
		...passAlong
	}: {
		component: PartComponent;
		siteConfig?: Record<string, unknown> | null; // In passAlong
	}): ProcessResult<RenderablePartComponent> {
		// log.debug('dataFetcher.processPart passAlong:%s', toStr(passAlong));
		const {
			descriptor,
			path
		} = component;

		const renderableComponent: RenderablePartComponent = {
			descriptor,
			mode: this.request.mode,
			path,
			type: 'part',
		}
		const processor = this.parts[descriptor];
		if (!processor) {
			const msg = `DataFetcher: processPart: No processor function added for part descriptor: ${descriptor}!`;
			log.warning(msg);
			renderableComponent.warning = msg;
			return {
				component: renderableComponent
			};
		}

		const {form} = getComponentSchema({
			key: descriptor,
			type: 'PART',
		}) as GetComponentReturnType;

		const htmlAreas = this.getHtmlAreas({
			ancestor: 'config',
			form,
		});
		// log.info('processPart htmlAreas:', htmlAreas);

		const processedPartComponent: ProcessedPartComponent = JSON.parse(JSON.stringify(component));
		for (let i = 0; i < htmlAreas.length; i++) {
			// log.info('component:', component);

			const path = htmlAreas[i];
			// log.info('path:', path);

			const html = getIn(component, path) as string;
			// log.info('html:', html);

			if (html) {
				const processedHtml = processHtml({
					value: html
				});
				const data = dataFromProcessedHtml(processedHtml);
				setIn(processedPartComponent, path, data);
			}
		} // for

		const processorResult = processor({
			...passAlong,
			component: processedPartComponent,
			content: this.content,
			request: this.request,
			runMode: RUN_MODE,
		});
		const {
			props,
			response,
		} = processorResult;
		if (response) {
			return { response };
		}
		renderableComponent.props = props;
		return {
			component: renderableComponent
		};
	} // processPart

	private processTextComponent({
		component,
	}: {
		component: TextComponent
	}): ProcessResult<RenderableTextComponent> {
		const {text} = component;
		const processedHtml = processHtml({
			value: text
		});
		const renderableTextComponent: RenderableTextComponent = JSON.parse(JSON.stringify(component));
		renderableTextComponent.mode = this.request.mode;
		renderableTextComponent.props = {
			data: dataFromProcessedHtml(processedHtml),
		};
		// log.debug('processTextComponent text renderableTextComponent:%s', toStr(renderableTextComponent));
		return {
			component: renderableTextComponent
		};
	}

	private processWithRegions({
		component: layoutOrPageComponent,
		form,
	}: {
		component: LayoutComponent | PageComponent;
		form:  NestedPartial<FormItem>[];
	}): ProcessedLayoutComponent | ProcessedPageComponent {
		const htmlAreas = this.getHtmlAreas({
			ancestor: 'config',
			form,
		});
		// log.info('processWithRegions htmlAreas:', htmlAreas);

		const processedLayoutOrPageComponent: ProcessedLayoutComponent | ProcessedPageComponent = JSON.parse(JSON.stringify(layoutOrPageComponent));

		//──────────────────────────────────────────────────────────────────────
		// This modifies layoutOrPage.config:
		//──────────────────────────────────────────────────────────────────────
		for (let i = 0; i < htmlAreas.length; i++) {
			// log.info('component:', component);

			const path = htmlAreas[i];
			// log.debug('processWithRegions path:', path);

			const html = getIn(layoutOrPageComponent, path) as string;
			// log.info('html:', html);

			if (html) {
				const processedHtml = processHtml({
					value: html
				});
				const data = dataFromProcessedHtml(processedHtml);
				setIn(processedLayoutOrPageComponent, path, data);
			}
		} // for
		// log.debug('processWithRegions config:', processedLayoutOrPageComponent.config);

		//──────────────────────────────────────────────────────────────────────
		// This modifies layoutOrPage.regions:
		//──────────────────────────────────────────────────────────────────────
		const regions = layoutOrPageComponent['regions'] || {};
		// log.debug('processWithRegions regions:', stringify(regions, {maxItems: Infinity}));
		const regionNames = Object.keys(regions);
		for (let i = 0; i < regionNames.length; i++) {
			const regionName = regionNames[i];
			const region = regions[regionName];
			const components = region.components;
			for (let j = 0; j < components.length; j++) {
				const origComponent = components[j];
				// log.info('processWithRegions i:%s, j:%s, component:%s', i, j, toStr(origComponent));
				const {
					component,
					response
				} = this.process({
					component: origComponent,
					// TODO This causes those instance properties to be written more than once.
					content: this.content,
					request: this.request,
				});
				if (component) {
					// @ts-expect-error Too complex/strict type generics.
					processedLayoutOrPageComponent.regions[regionName].components[j] = component;
				}
				if (response) {
					// This shouldn't happen, but if it does, log it.
					log.warning('processWithRegions response:%s', toStr(response));
				}
			}
		}
		// log.debug('processWithRegions regions:', stringify(processedLayoutOrPageComponent.regions, {maxItems: Infinity}));
		return processedLayoutOrPageComponent;
	} // processWithRegions

	public addContentType<
		CONTENT extends Content = PageContent,
		PAGE_DESCRIPTOR extends PageDescriptor = PageDescriptor,
	>(contentTypeName: string, {
		processor
	}: {
		processor: ContentTypeProcessorFunction<CONTENT, PAGE_DESCRIPTOR>;
	}) {
		this.contentTypes[contentTypeName] = processor // as PageComponentProcessorFunction;
	}

	public addLayout<
		OVERRIDES extends Record<string, unknown> = Record<string, never>,
		LAYOUT_DESCRIPTOR extends LayoutDescriptor = LayoutDescriptor,
	>(descriptor: LAYOUT_DESCRIPTOR, {
		processor
	}: {
		processor: LayoutComponentProcessorFunction<LAYOUT_DESCRIPTOR, OVERRIDES>;
	}) {
		// log.debug('addLayout:', descriptor);
		this.layouts[descriptor] = processor as LayoutComponentProcessorFunction;
	}

	public addPage<
		OVERRIDES extends Record<string, unknown> = Record<string, never>,
		PAGE_DESCRIPTOR extends PageDescriptor = PageDescriptor,
	>(descriptor: PAGE_DESCRIPTOR, {
		processor
	}: {
		processor: PageComponentProcessorFunction<PAGE_DESCRIPTOR, OVERRIDES>;
	}) {
		// log.debug('addPage:', descriptor);
		this.pages[descriptor] = processor as PageComponentProcessorFunction;
	}

	public addPart<
		OVERRIDES extends Record<string, unknown> = Record<string, never>,
		PART_DESCRIPTOR extends PartDescriptor = PartDescriptor // gotten from the passed descriptor parameter below
	>(descriptor: PART_DESCRIPTOR, {
		processor
	}: {
		processor: PartComponentProcessorFunction<PART_DESCRIPTOR, OVERRIDES>;
	}) {
		// log.debug('addPart:', descriptor);
		this.parts[descriptor] = processor as PartComponentProcessorFunction;
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
	}: ProcessParams): ProcessResult {
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
				return {
					response: {
						status: 404
					}
				}
			}
		}
		this.content = content;

		// const { method } = request;
		const { type: contentType } = content;

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
			case 'part': return this.processPart({
				component,
				...passAlong
			});
			case 'layout': return this.processLayout({
				component: component as LayoutComponent,
				...passAlong
			});
			case 'text': return this.processTextComponent({
				component: component as TextComponent,
			});
			case 'fragment': return this.processFragment({
				component: component as FragmentComponent,
				...passAlong
			});
			// case 'page':
			default: // Since componentType is undefined when using automatic page templates, we have to assume it's a page.
				return this.processPage({
					component: component as PageComponent | PageComponentWhenSpecificTemplate | PageComponentWhenAutomaticTemplate,
					...passAlong
				});
				// throw new Error(`processComponents: component type not supported: ${componentType}!`);
		}
	}
} // class DataFetcher
