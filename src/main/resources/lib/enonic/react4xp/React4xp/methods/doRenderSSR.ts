import type {React4xp as React4xpNamespace} from '../../../../../index.d';
import type {React4xp} from '../../React4xp';

//import {toStr} from 'JS_UTILS_ALIAS/value/toStr';

import {getComponentChunkNames}  from '/lib/enonic/react4xp/dependencies/getComponentChunkNames';
import {render as renderSSRJava} from '/lib/enonic/react4xp/ssr/render';


// TODO: Check docs! Is 'doRenderSSR' an API-breaking name and signature change? Re-insert old name!
/** Renders a purely static HTML markup of ONLY the react4xp entry (without a surrounding HTML markup or container).
 *  Can override props that have previously been added to this component.
 *
 *  Returns an object: { html?: string, error?: string }
 *      (The keys 'html' and 'error' are as returned from ServerSideRenderer.java - so beware if ever refactoring them!)
 *  ...where 'html' is a rendered HTML string if successful component rendering (undefined on error),
 *  and 'error' an error message string from the Nashorn engine if any error occurred (undefined if successful rendering).
 */
export function doRenderSSR<
	Props extends {
		react4xpId? :React4xpNamespace.Id
	} = object
>(this: React4xp, overrideProps? :Props) {
	//log.debug('doRenderSSR overrideProps:%s', toStr(overrideProps));
	//log.debug('doRenderSSR this.jsxPath:%s', toStr(this.jsxPath));
	//log.debug('doRenderSSR this.props:%s', toStr(this.props));
	let result :{
		error? :string
		html? :string
	} = {};
	try {
		result = __.toNativeObject( // Converts arrays or complex Java objects to JavaScript data types
			renderSSRJava(
				this.jsxPath,
				//this.assetPath.slice(0, -3), // Remove .js
				JSON.stringify(overrideProps || this.props),
				getComponentChunkNames(this.jsxPath)
			)
		);
		//log.debug('doRenderSSR result1:%s', toStr(result)); // undefined
	} catch (e) {
		//log.error('Stacktrace', e);
		//log.debug('doRenderSSR result2:%s', toStr(result));
		result.error = e.message;
	}

	if (result.error && !this.react4xpId) {
		//log.debug('doRenderSSR this.react4xpId:%s', toStr(this.react4xpId));
		this.react4xpId = "react4xp_error";
		this.uniqueId();
	}

	return result;
}
