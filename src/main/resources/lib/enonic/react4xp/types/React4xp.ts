import type {
	Component,
	PageContributions,
	Request
} from '@enonic-types/core';
import type { AssetUrlParams } from '@enonic-types/lib-portal'; // Might be deprecated in XP8.
import type { Cache } from './Cache';

type OneOrMore<T> = T | T[]

export type Entry = string|Component

export type EntryName = string

export type Id = HTMLElement['id']

export type UrlType = AssetUrlParams['type'];

export interface Instance<
	Props extends object = object
> {
	// Private fields/properties
	templateDescriptorCache?: Cache

	// Public fields/properties
	assetPath: string; // 'path/filename.hash.js'
	component: Component;
	hasRegions: 0|1;
	jsxPath: string; // 'path/filename' without '.hash.js'
	isPage: 0|1;
	props: Props;
	react4xpId: Id;
	react4xpIdIsLocked: boolean;

	// Public methods
	checkIdLock: () => void
	ensureAndLockId: () => void
	ensureAndLockBeforeRendering: () => void
	doRenderSSR: (overrideProps?: Props) => {
		error?: string
		html?: string
	}
	makeErrorMessage: (attribute: string) => string
	renderBody: (params: {
		body?: string
		request?: Request
		ssr?: boolean
	}) => string
	renderPageContributions: (params: {
		hydrate?: boolean
		pageContributions?: PageContributions
		request?: Request
		ssr?: boolean
		urlType?: UrlType
	}) => unknown
	renderSSRIntoContainer: (params: {
		body: string
		request: Request
	}) => string
	renderTargetContainer: (params: {
		appendErrorContainer: boolean
		body: string
		content: string
	}) => string
	renderWarningPlaceholder: () => string
	setHasRegions: (hasRegions: boolean) => Instance
	setId: (id: Id) => Instance
	setIsPage: (isPage: boolean) => Instance
	setJsxPath: (jsxPath: string) => Instance
	setProps: (props: Props) => Instance
	uniqueId: () => Instance
} // interface Instance
