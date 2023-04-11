import type {Component} from '@enonic-types/lib-portal';
import type {Cache} from './Cache';
import type {ComponentGeneric} from './Component';
import type {PageContributions} from './PageContributions';
import type {Request} from './Request';


type OneOrMore<T> = T | T[]

export type Entry = string|Component

export type EntryName = string
	//type EntryNames = Array<string>

export type Id = string

export interface Props {
	react4xpId?: Id
}

export interface Instance<
	Props extends {
		react4xpId?: Id
	} = object
> {
	// Private fields/properties
	templateDescriptorCache?: Cache

	// Public fields/properties
	assetPath: string; // 'path/filename.hash.js'
	component: ComponentGeneric;
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
	setHasRegions: (hasRegions: boolean) => Instance
	setId: (react4xpId: Id) => Instance
	setIsPage: (isPage: boolean) => Instance
	setJsxPath: (jsxPath: string) => Instance
	setProps: (props: Props) => Instance
	uniqueId: () => Instance
} // interface Instance
