import type {Cache} from './Cache';
import type {ComponentGeneric} from './Component';
import type {PageContributions} from './PageContributions';
import type {Request} from './Request';
import type {Response} from './Response';


type OneOrMore<T> = T | T[]


export namespace React4xp {

	type Entry = string|object
	type EntryName = string
	//type EntryNames = Array<string>
	type Id = string

	export interface Props {
		react4xpId: Id
	}

	interface Instance<
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
			clientRender?: boolean
			request?: Request
		}) => string
		renderPageContributions: (params: {
			pageContributions?: PageContributions
			clientRender?: boolean
			request?: Request
			serveExternals?: boolean
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
		setJsxPath: (jsxPath: string)  => Instance
		setProps: (props: Props) => Instance
		uniqueId: () => Instance
	} // interface Instance

	export interface Class {
		constructor: (entry: Entry) => Instance
		// Public static method
		_buildFromParams?: <
			Props extends {
				react4xpId?: Id
			} = object
		>(params: {
			entry?: Entry,
			id?: Id,
			uniqueId?: boolean|string,
			props?: Props
		}) => Instance
		_clearCache: () => void
		getAssetUrls: (entries: OneOrMore<EntryName>) => Array<string>
		getClientUrl: () => string
		getExecutorUrl: () => string
		render: <Props extends object = object>(
			entry: Entry,
			props?: Props,
			request?: Request,
			options?: {
				body?: string
				clientRender?: boolean
				//id?: string // TODO renamed?
				pageContributions?: PageContributions
				react4xpId?: Id
				serveExternals?: boolean
				uniqueId?: boolean|string
			}
		) => Response
	} // interface Class

} // namespace React4xp
