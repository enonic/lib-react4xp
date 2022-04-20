import type {
	OneOrMore,
	PageContributions,
	React4xp as React4xpNamespace
} from '../../../../index.d';


import {getClientUrl} from '/lib/enonic/react4xp/asset/client/getClientUrl';
import {getExternalsUrls} from '/lib/enonic/react4xp/asset/externals/getExternalsUrls';
import {getComponentChunkUrls} from '/lib/enonic/react4xp/dependencies/getComponentChunkUrls';

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

	const pageContributions :PageContributions = {
		headEnd: [] // Lighthouse recommends meta charset in first 1024 bytes, thus we use headEnd not headBegin
	};

	// https://www.growingwiththeweb.com/2014/02/async-vs-defer-attributes.html
	// * If the script is modular and does not rely on any scripts then use async.
	// * If the script relies upon or is relied upon by another script then use defer.

	if (serveExternals) {
		pageContributions.headEnd.push(`<script defer src="${getExternalsUrls()}"></script>\n`);
	}

	const componentChunkUrls = getComponentChunkUrls(entries);
	for (let i = 0; i < componentChunkUrls.length; i++) {
		const componentChunkUrl = componentChunkUrls[i];
		if (componentChunkUrl.endsWith('.css')) {
			pageContributions.headEnd.push(`<link href="${componentChunkUrl}" rel="stylesheet" type="text/css" />\n`);
		} else if(!suppressJS) { // Treat other dependencies as JS and add them in a script tag. Unless suppressJS, in which case: skip them.
			pageContributions.headEnd.push(`<script defer src="${componentChunkUrl}"></script>\n`);
		}
	}

	if (!suppressJS) {
		pageContributions.headEnd.push(`<script defer src="${getClientUrl()}"></script>\n`);
	}

	//log.debug('buildPageContributions() pageContributions:%s', toStr(pageContributions));
	return pageContributions;
} // buildPageContributions
