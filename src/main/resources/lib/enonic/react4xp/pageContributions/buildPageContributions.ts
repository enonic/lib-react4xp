import type {
	OneOrMore,
	PageContributions,
	React4xp as React4xpNamespace
} from '../../../../index.d';


import {appendCssToHeadEnd} from './appendCssToHeadEnd';
import {appendScriptToBodyEnd} from './appendScriptToBodyEnd';
import {getAllUrls} from '/lib/enonic/react4xp/dependencies/getAllUrls';


/** Use the json files built by webpack in other libraries (react4xp-build-components, react4xp-runtime-externals, react4xp-runtime-client)
 *  to fetch items of <script src="url" /> for common chunks:
 *   -the dependency chunks of specific entries (array of entry names in the argument, gets all of the dependencies if empty),
 *   -an optional Externals chunk,
 *   -and an optional frontend-client chunk (which falls back to the built-in client url if missing)?
 * @param entries An array (also accepts string, if only one item) of Entry names for React4xp components, for which we want to build the set
 * of dependencies.
 * @returns an object ready to be returned as a pageContributions.js from an XP component. Puts dependencies into the bodyEnd attribute. */
export function buildPageContributions({
	entries,
	suppressJS,
	serveExternals = true
} :{
	entries :OneOrMore<React4xpNamespace.EntryName>,
	suppressJS :boolean,
	serveExternals? :boolean
}) {
	//log.debug('buildPageContributions() entries:%s', toStr(entries));

	const chunkUrls = getAllUrls({  // This is where the clientwrapper comes in...
		entries,
		suppressJS,
		serveExternals
	});
	//log.debug('buildPageContributions() chunkUrls:%s', toStr(chunkUrls));

	const pageContributions :PageContributions = {};
	chunkUrls.forEach(chunkUrl => {
		//log.debug('buildPageContributions() chunkUrl:%s', toStr(chunkUrl));
		if (chunkUrl.endsWith(".css")) {
			appendCssToHeadEnd(chunkUrl, pageContributions);

			// Treat other dependencies as JS and add them in a script tag. Unless suppressJS, in which case: skip them.
		} else {
			appendScriptToBodyEnd(chunkUrl, pageContributions);
		}
	}); // forEach

	//log.debug('buildPageContributions() pageContributions:%s', toStr(pageContributions));
	return pageContributions;
} // buildPageContributions
