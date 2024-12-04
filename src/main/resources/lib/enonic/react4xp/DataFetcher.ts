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
	PageComponentWhenCustomized,
	PageDescriptor,
	// Part,
	PartComponent,
	PartDescriptor,
	Request,
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
	RenderableLayoutComponent,
	RenderablePageComponent,
	RenderablePartComponent,
	RenderableTextComponent,
} from '@enonic/react-components/nashorn';


import {getIn} from '@enonic/js-utils/object/getIn';
import {setIn} from '@enonic/js-utils/object/setIn';
import {toStr} from '@enonic/js-utils/value/toStr';
// import {stringify} from 'q-i';

import {get as getContentByKey} from '/lib/xp/content';
import {
	getComponent as getComponentSchema,
	listSchemas
} from '/lib/xp/schema';
import {
	getContent as getCurrentContent,
	processHtml
} from '/lib/xp/portal';
import { getCachedPageComponentFromContentType } from '/lib/enonic/react4xp/pageTemplate/getCachedPageComponentFromContentType';
import { getCachedPageComponentFromPageTemplateContentId } from '/lib/enonic/react4xp/pageTemplate/getCachedPageComponentFromPageTemplateContentId';

import { dataFromProcessedHtml } from '/lib/enonic/react4xp/dataFromProcessedHtml';


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

export type LayoutComponentToPropsParams<T = Record<string, never>> = Merge<{
	component: ProcessedLayoutComponent;
	content?: PageContent;
	siteConfig?: Record<string, unknown> | null; // In passAlong
	request: Request;
},T>

export type PageComponentToPropsParams<T = Record<string, never>> = Merge<{
	component: ProcessedPageComponent;
	content?: PageContent;
	siteConfig?: Record<string, unknown> | null; // In passAlong
	request: Request;
}, T>

export type ProcessedLayoutComponent = LayoutComponent & {
	props?: Record<string, unknown>;
}
export type ProcessedPageComponent = PageComponent & {
	props?: Record<string, unknown>;
}

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

export type PartComponentToPropsParams<
	PART_DESCRIPTOR extends PartDescriptor = PartDescriptor,
	OVERRIDE = Record<string, never>
> = Merge<{
	component: PartComponent<PART_DESCRIPTOR>;
	content?: PageContent;
	siteConfig?: Record<string, unknown> | null; // In passAlong
	request: Request;
}, OVERRIDE>

export type LayoutComponentToPropsFunction = (params: LayoutComponentToPropsParams) => Record<string, unknown>;
export type PageComponentToPropsFunction = (params: PageComponentToPropsParams) => Record<string, unknown>;
export type PartComponentToPropsFunction<
	PART_DESCRIPTOR extends PartDescriptor = PartDescriptor
> = (params: PartComponentToPropsParams<PART_DESCRIPTOR>) => Record<string, unknown>;

export class DataFetcher {
	private content: PageContent;
	private layouts: Record<LayoutDescriptor, LayoutComponentToPropsFunction> = {};
	private mixinSchemas: Record<string, MixinSchema> = {}
	private pages: Record<PageDescriptor, PageComponentToPropsFunction> = {};
	private parts: Record<PartDescriptor, PartComponentToPropsFunction> = {};
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

	private processFragment({
		component,
		...passAlong
	}: {
		component: FragmentComponent;
		siteConfig?: Record<string, unknown> | null; // In passAlong
	}) {
		// log.debug('dataFetcher.processFragment passAlong:%s', toStr(passAlong));
		const {
			fragment: key,
			path
		} = component;
		// log.info('processFragment fragment key:', key);

		// @ts-expect-error Too complex/strict type generics.
		const fragmentContent = getContentByKey<FragmentContent>({key});
		if (!fragmentContent) {
			throw new Error(`processFragment: content not found for key: ${key}!`);
		}
		// log.info('processFragment content:', content);

		const {fragment} = fragmentContent;
		if (!fragment) {
			throw new Error(`processFragment: fragment not found in content with key: ${key}!`);
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
		throw new Error(`processFragment: fragment type not supported: ${type}!`);
	}

	private processLayout({
		component,
		...passAlong
	}: {
		component: LayoutComponent;
		siteConfig?: Record<string, unknown> | null; // In passAlong
	}): RenderableLayoutComponent {
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
			regions: JSON.parse(JSON.stringify(regions)),
			type: 'layout',
		};
		const toProps = this.layouts[descriptor];
		if (!toProps) {
			const msg = `DataFetcher: processLayout: No toProps function added for layout descriptor: ${descriptor}!`;
			log.warning(msg);
			renderableComponent.warning = msg;
			return renderableComponent;
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

		renderableComponent.props = toProps({
			component: processedLayoutComponent,
			content: this.content,
			request: this.request,
			...passAlong
		});
		return renderableComponent;
	} // processLayout

	private processPage({
		component,
		...passAlong
	}: {
		component: PageComponent;
		siteConfig?: Record<string, unknown> | null; // In passAlong
	}): RenderablePageComponent {
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
				component = getCachedPageComponentFromContentType({ contentType });
				// log.debug('processPage: No component.descriptor. contentType:%s component(from page template):%s', contentType, toStr(component));
			} else { // Page Template: Specific
				// log.debug('processPage: No descriptor. componentType:%s pageTemplateContentId:%s', componentType, pageTemplateContentId);
				component = getCachedPageComponentFromPageTemplateContentId({pageTemplateContentId});
				// log.debug('processPage: No descriptor. componentType:%s pageTemplateContentId:%s component(from page template):%s', componentType, pageTemplateContentId, toStr(component));
			}
		}

		const {
			descriptor,
			path, // Should always be '/'
			regions, // CAUTION: Is undefined when using page templates.
		} = component as PageComponentWhenCustomized;
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
			regions: JSON.parse(JSON.stringify(regions)),
			type: 'page',
		};

		const toProps = this.pages[descriptor];
		if (!toProps) {
			const msg = `DataFetcher: processPage: No toProps function added for page descriptor: ${descriptor}!`;
			log.warning(msg);
			renderableComponent.warning = msg;
			return renderableComponent;
		}

		const {form} = getComponentSchema({
			key: descriptor,
			type: 'PAGE',
		}) as GetComponentReturnType;

		const processedPageComponent = this.processWithRegions({
			component,
			form,
		}) as ProcessedPageComponent;

		renderableComponent.props = toProps({
			component: processedPageComponent,
			content: this.content,
			request: this.request,
			...passAlong
		});
		return renderableComponent;
	} // processPage

	private processPart({
		component,
		...passAlong
	}: {
		component: PartComponent;
		siteConfig?: Record<string, unknown> | null; // In passAlong
	}): RenderablePartComponent {
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
		const toProps = this.parts[descriptor];
		if (!toProps) {
			const msg = `DataFetcher: processPart: No toProps function added for part descriptor: ${descriptor}!`;
			log.warning(msg);
			renderableComponent.warning = msg;
			return renderableComponent;
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

		const processedPartComponent = JSON.parse(JSON.stringify(component));
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

		renderableComponent.props = toProps({
			component: processedPartComponent,
			content: this.content,
			request: this.request,
			...passAlong
		});
		return renderableComponent;
	} // processPart

	private processTextComponent({
		component,
	}: {
		component: TextComponent
	}): RenderableTextComponent {
		const {text} = component;
		const processedHtml = processHtml({
			value: text
		});
		const renderableTextComponent: RenderableTextComponent = JSON.parse(JSON.stringify(component));
		renderableTextComponent.props = {
			data: dataFromProcessedHtml(processedHtml),
			mode: this.request.mode,
		};
		// log.debug('processTextComponent text renderableTextComponent:%s', toStr(renderableTextComponent));
		return renderableTextComponent;
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
				const component = components[j];
				// @ts-expect-error Too complex/strict type generics.
				processedLayoutOrPageComponent.regions[regionName].components[j] = this.process({
					component,
					// TODO This causes those instance properties to be written more than once.
					content: this.content,
					request: this.request,
				});
			}
		}
		// log.debug('processWithRegions regions:', stringify(processedLayoutOrPageComponent.regions, {maxItems: Infinity}));
		return processedLayoutOrPageComponent;
	} // processWithRegions

	public addLayout<T = Record<string, never>>(descriptor: string, {
		toProps
	}: {
		toProps: (params: LayoutComponentToPropsParams<T>) => Record<string, unknown>;
	}) {
		// log.debug('addLayout:', descriptor);
		this.layouts[descriptor] = toProps as LayoutComponentToPropsFunction;
	}

	public addPage<T = Record<string, never>>(descriptor: string, {
		toProps
	}: {
		toProps: (params: PageComponentToPropsParams<T>) => Record<string, unknown>;
	}) {
		// log.debug('addPage:', descriptor);
		this.pages[descriptor] = toProps as PageComponentToPropsFunction;
	}

	public addPart<
		OVERRIDE = Record<string, never>,
		PART_DESCRIPTOR extends PartDescriptor = PartDescriptor // gotten from the passed descriptor parameter below
	>(descriptor: PART_DESCRIPTOR, {
		toProps
	}: {
		toProps: (params: PartComponentToPropsParams<PART_DESCRIPTOR, OVERRIDE>) => Record<string, unknown>;
	}) {
		// log.debug('addPart:', descriptor);
		this.parts[descriptor] = toProps as PartComponentToPropsFunction<PART_DESCRIPTOR>;
	}

	public process({
		component,
		content,
		request,
		...passAlong
	}: {
		component?: Component;
		content?: PageContent;
		request: Request;
		[passAlongKey: string]: unknown;
	}): RenderableComponent {
		if (!request) {
			throw new Error(`process: request is required!`);
		}
		this.request = request;
		// log.debug('dataFetcher.process passAlong:%s', toStr(passAlong));
		// content = this.getCurrentContent && this.getCurrentContent() as PageContent
		if (!content) {
			content = getCurrentContent!() as PageContent;
			if (!content) {
				throw new Error(`process: getCurrentContent returned null!`);
			}
		}
		this.content = content;
		if (!component) {
			component = (content.page || content.fragment) as Component;
			if (!component) {
				throw new Error(`process: component not passed and content.page and content.fragment not found!`);
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
					component: component as PageComponent,
					...passAlong
				});
				// throw new Error(`processComponents: component type not supported: ${componentType}!`);
		}
	}
} // class DataFetcher
