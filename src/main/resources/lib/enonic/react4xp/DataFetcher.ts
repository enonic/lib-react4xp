import type {
	Component,
	Content,
	FragmentComponent,
	Layout,
	LayoutComponent,
	LiteralUnion,
	Page,
	PageComponent,
	Part,
	PartComponent,
	Request,
	RequestMode,
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
} from '@enonic/react-components';


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
	getSiteConfig as getCurrentSiteConfig,
	processHtml
} from '/lib/xp/portal';
import { getDescriptorFromTemplate } from '/lib/enonic/react4xp/React4xp/getDescriptorFromTemplate';

import {replaceMacroComments} from './replaceMacroComments';


export type FragmentContent<
	Component extends LayoutComponent | PartComponent = Layout | Part
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

interface LayoutComponentToPropsParams {
	component: LayoutComponent;
	content?: PageContent;
	processedComponent: ProcessedLayoutComponent;
	processedConfig: Record<string, unknown>;
	siteConfig?: Record<string, unknown> | null;
	request: Request;
	[passAlong: string]: unknown;
}

interface PageComponentToPropsParams {
	component: PageComponent;
	content?: PageContent;
	processedComponent: ProcessedPageComponent;
	processedConfig: Record<string, unknown>;
	siteConfig?: Record<string, unknown> | null;
	request: Request;
	[passAlong: string]: unknown;
}

export type ProcessedLayoutComponent = LayoutComponent & {
	props?: Record<string, unknown>;
}
export type ProcessedPageComponent = PageComponent & {
	props?: Record<string, unknown>;
}

export type PageContent<
	Data = Record<string, unknown>,
	Type extends string = string,
	Component extends PageComponent = Page
> = Content<
	Data,
	Type,
	// @ts-expect-error Does not satisfy the type constraint
	Component
>

interface PartComponentToPropsParams {
	component: PartComponent;
	content?: PageContent;
	processedConfig: Record<string, unknown>;
	siteConfig?: Record<string, unknown> | null;
	request: Request;
	[passAlong: string]: unknown;
}

type LayoutComponentToPropsFunction = (params: LayoutComponentToPropsParams) => Record<string, unknown>;
type PageComponentToPropsFunction = (params: PageComponentToPropsParams) => Record<string, unknown>;
type PartComponentToPropsFunction = (params: PartComponentToPropsParams) => Record<string, unknown>;

export class DataFetcher {
	private layouts: Record<string,LayoutComponentToPropsFunction> = {};
	private pages: Record<string,PageComponentToPropsFunction> = {};
	private parts: Record<string,PartComponentToPropsFunction> = {};
	private mixinSchemas: Record<string, MixinSchema> = {}

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
		content,
		request,
		siteConfig,
		...passAlong
	}: {
		component: FragmentComponent;
		content?: PageContent;
		request: Request;
		siteConfig?: Record<string, unknown> | null;
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
				content,
				request,
				siteConfig,
				...passAlong
			});
		}
		if(type === 'layout') {
			return this.processLayout({
				component: fragment,
				content,
				request,
				siteConfig,
				...passAlong
			});
		}
		if(type === 'text') {
			return this.processTextComponent({
				component: fragment as TextComponent,
				mode: request.mode,
		});
		}
		throw new Error(`processFragment: fragment type not supported: ${type}!`);
	}

	private processLayout({
		component,
		content,
		request,
		siteConfig,
		...passAlong
	}: {
		component: LayoutComponent;
		content?: PageContent;
		request: Request;
		siteConfig?: Record<string, unknown> | null;
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
			path,
			regions: JSON.parse(JSON.stringify(regions)),
			type: 'layout',
		};
		const toProps = this.layouts[descriptor];
		if (!toProps) {
			log.warning(`processLayout: toProps not found for descriptor: ${descriptor}!`);
			return renderableComponent;
		}

		const {form} = getComponentSchema({
			key: descriptor,
			type: 'LAYOUT',
		}) as GetComponentReturnType;

		const processedLayoutComponent = this.processWithRegions({
			component,
			content,
			form,
			request,
		}) as ProcessedLayoutComponent;
		// log.info('DataFetcher processLayout processedLayoutComponent:%s', toStr(processedLayoutComponent))

		renderableComponent.props = toProps({
			component,
			content,
			processedComponent: processedLayoutComponent,
			processedConfig: processedLayoutComponent.config,
			siteConfig, // : this.getCurrentSiteConfig && this.getCurrentSiteConfig() as Record<string, unknown>,
			request,
			...passAlong
		});
		// renderableComponent.processedConfig = processedLayoutComponent.config;
		return renderableComponent;
	} // processLayout

	private processPage({
		component,
		content,
		request,
		siteConfig,
		...passAlong
	}: {
		component: PageComponent;
		content?: PageContent;
		request: Request;
		siteConfig?: Record<string, unknown> | null;
	}): RenderablePageComponent {
		// log.debug('processPage component:', component);
		// log.debug('dataFetcher.processPage passAlong:%s', toStr(passAlong));
		let {descriptor} = component;
		const {
			path,
			regions,
			// @ts-expect-error TODO PageComponent Type is missing template?: string in lib-portal
			template,
			type,
		} = component;
		if (!descriptor) {
			descriptor = getDescriptorFromTemplate(type, template);
		}
		if (!descriptor) {
			throw new Error(`processPage: descriptor not found for component: ${toStr(component)}!`);
		}
		const renderableComponent: RenderablePageComponent = {
			// Do not ass config, it should not be exposed to client-side
			descriptor,
			path,
			regions: JSON.parse(JSON.stringify(regions)),
			type: 'page',
		};
		const toProps = this.pages[descriptor];
		if (!toProps) {
			log.warning(`processPage: toProps not found for descriptor: ${descriptor}!`);
			return renderableComponent;
		}

		const {form} = getComponentSchema({
			key: descriptor,
			type: 'PAGE',
		}) as GetComponentReturnType;

		const processedComponent = this.processWithRegions({
			component,
			content,
			form,
			request,
		}) as ProcessedPageComponent;

		renderableComponent.props = toProps({
			component,
			content,
			processedComponent: processedComponent,
			processedConfig: processedComponent.config,
			siteConfig, // : this.getCurrentSiteConfig && this.getCurrentSiteConfig() as Record<string, unknown>,
			request,
			...passAlong
		});
		// renderableComponent.processedConfig = processedComponent.config;
		return renderableComponent;
	}

	private processPart({
		component,
		content,
		request,
		siteConfig,
		...passAlong
	}: {
		component: PartComponent;
		content?: PageContent;
		request: Request;
		siteConfig?: Record<string, unknown> | null;
	}): RenderablePartComponent {
		// log.debug('dataFetcher.processPart passAlong:%s', toStr(passAlong));
		const {
			descriptor,
			path
		} = component;

		const renderableComponent: RenderablePartComponent = {
			descriptor,
			path,
			type: 'part',
		}
		const toProps = this.parts[descriptor];
		if (!toProps) {
			log.warning(`processPart: toProps not found for descriptor: ${descriptor}!`);
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

		const processedComponent = JSON.parse(JSON.stringify(component));
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
				const data = replaceMacroComments(processedHtml);
				setIn(processedComponent, path, data);
			}
		} // for

		renderableComponent.props = toProps({
			component,
			content,
			processedConfig: processedComponent.config,
			siteConfig,//: this.getCurrentSiteConfig && this.getCurrentSiteConfig() as Record<string, unknown>,
			request,
			...passAlong
		});
		// renderableComponent.processedConfig = processedComponent.config;
		return renderableComponent;
	}

	private processTextComponent({
		component,
		mode
	}: {
		component: TextComponent
		mode: LiteralUnion<RequestMode>
	}): RenderableTextComponent {
		const {text} = component;
		const processedHtml = processHtml({
			value: text
		});
		const renderableTextComponent: RenderableTextComponent = JSON.parse(JSON.stringify(component));
		renderableTextComponent.props = {
			data: replaceMacroComments(processedHtml),
			mode
		};
		return renderableTextComponent;
	}

	private processWithRegions({
		component: layoutOrPageComponent,
		content,
		form,
		request,
	}: {
		component: LayoutComponent | PageComponent;
		content?: PageContent;
		form:  NestedPartial<FormItem>[];
		request: Request;
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
				const data = replaceMacroComments(processedHtml);
				setIn(processedLayoutOrPageComponent, path, data);
			}
		} // for
		// log.debug('processWithRegions config:', processedLayoutOrPageComponent.config);

		//──────────────────────────────────────────────────────────────────────
		// This modifies layoutOrPage.regions:
		//──────────────────────────────────────────────────────────────────────
		const {regions} = layoutOrPageComponent;
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
					content,
					request,
				});
			}
		}
		// log.debug('processWithRegions regions:', stringify(processedLayoutOrPageComponent.regions, {maxItems: Infinity}));
		return processedLayoutOrPageComponent;
	} // processWithRegions

	public addLayout(descriptor: string, {
		toProps
	}: {
		toProps: (params: LayoutComponentToPropsParams) => Record<string, unknown>;
	}) {
		// log.debug('addLayout:', descriptor);
		this.layouts[descriptor] = toProps;
	}

	public addPage(descriptor: string, {
		toProps
	}: {
		toProps: (params: PageComponentToPropsParams) => Record<string, unknown>;
	}) {
		// log.debug('addPage:', descriptor);
		this.pages[descriptor] = toProps;
	}

	public addPart(descriptor: string, {
		toProps
	}: {
		toProps: (params: PartComponentToPropsParams) => Record<string, unknown>;
	}) {
		// log.debug('addPart:', descriptor);
		this.parts[descriptor] = toProps;
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
	}): RenderableComponent {
		// log.debug('dataFetcher.process passAlong:%s', toStr(passAlong));
		// content = this.getCurrentContent && this.getCurrentContent() as PageContent
		if (!content) {
			content = getCurrentContent!() as PageContent;
			if (!content) {
				throw new Error(`process: getCurrentContent returned null!`);
			}
		}
		if (!component) {
			component = (content.page || content.fragment) as Component;
			if (!component) {
				throw new Error(`process: component not passed and content.page and content.fragment not found!`);
			}
		}
		const siteConfig = getCurrentSiteConfig();
		if (!siteConfig) {
			log.warning(`process: getCurrentSiteConfig returned null!`);
		}
		const {type} = component;
		switch (type) {
			case 'part': return this.processPart({
				component,
				content,
				request,
				siteConfig,
				...passAlong
			});
			case 'layout': return this.processLayout({
				component: component as LayoutComponent,
				content,
				request,
				siteConfig,
				...passAlong
			});
			case 'page': return this.processPage({
				component: component as PageComponent,
				content,
				request,
				siteConfig,
				...passAlong
			});
			case 'text': return this.processTextComponent({
				component: component as TextComponent,
				mode: request.mode,
			});
			case 'fragment': return this.processFragment({
				component: component as FragmentComponent,
				content,
				request,
				siteConfig,
				...passAlong
			});
			default: throw new Error(`processComponents: component type not supported: ${type}!`);
		}
	}
} // class DataFetcher

export function fetchData({
	component,
	content,
	request,
}: {
	component?: Component;
	content?: PageContent;
	request: Request;
}): RenderableComponent {
	const processor = new DataFetcher();
	return processor.process({
		component,
		content,
		request
	});
}
