import type {ComponentGeneric} from './Component';
import type {PageContributions} from './PageContributions';
import type {Request} from './Request';
//import type {Cache} from './Cache';


export namespace React4xp {

	type Entry = string|object
	type EntryName = string
	//type EntryNames = Array<string>
	type Id = string

	interface Props {
		react4xpId :Id
	}

	interface Class<
		Props extends {
			react4xpId? :Id
		} = {}
	> {
		// Static fields/properties

		// Private fields/properties
		templateDescriptorCache? :Cache

		// Public fields/properties
		assetPath :string; // 'path/filename.hash.js'
		component :ComponentGeneric;
		hasRegions :0|1;
		jsxPath :string; // 'path/filename' without '.hash.js'
		isPage :0|1;
		props :Props;
		react4xpId :Id;
		react4xpIdIsLocked :boolean;

		// Public static fields/properties
		/*_buildFromParams? :(params :{
			entry? :Entry,
			id? :Id,
			uniqueId? :boolean|string,
			props? :Props
		}) => Class
		_clearCache? :() => void
		render? :(
			entry :Entry,
			props? :Props,
			request? :Request,
			options? :{
				body? :string
				clientRender? :boolean
				//id? :string // TODO renamed?
				pageContributions? :PageContributions
				react4xpId? :Id
				uniqueId? :boolean|string
			}
		) => Response*/

		// Public methods
		checkIdLock :() => void
		ensureAndLockId :() => void
		ensureAndLockBeforeRendering :() => void
		doRenderSSR :(overrideProps? :Props) => {
			error? :string
			html? :string
		}
		renderBody :(params :{
			body? :string,
			clientRender? :boolean,
			request? :Request
		}) => string
		renderPageContributions :(params :{
			pageContributions? :PageContributions,
			clientRender? :boolean,
			request? :Request
		}) => unknown
		renderSSRIntoContainer :(
			body :string,
			request :Request,
			react4xpObj :Class
		) => string
		renderTargetContainer :(
			body :string,
			content :string,
			appendErrorContainer :boolean
		) => string
		setHasRegions :(hasRegions :boolean) => Class
		setId :(react4xpId :Id) => Class
		setIsPage :(isPage :boolean) => Class
		setJsxPath :(jsxPath :string)  => Class
		setProps :(props :Props) => Class
		uniqueId :() => Class
	} // interface Class

} // namespace React4xp
