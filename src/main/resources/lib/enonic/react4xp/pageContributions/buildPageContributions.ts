import type {
	OneOrMore,
	PageContributions,
	React4xp as React4xpNamespace
} from '../../../../index.d';


import endsWith from '@enonic/js-utils/string/endsWith';
import {getClientUrl} from '/lib/enonic/react4xp/asset/client/getClientUrl';
import {getGlobalsUrls} from '../asset/globals/getGlobalsUrls';
import {getComponentChunkUrls} from '/lib/enonic/react4xp/dependencies/getComponentChunkUrls';

/** Use the json files built by (@enonic/react4xp)
 *  to fetch items of <script src="url" /> for common chunks:
 *   -the dependency chunks of specific entries (array of entry names in the argument, gets all of the dependencies if empty),
 *   -an optional Globals chunk,
 *   -and an optional frontend-client chunk (which falls back to the built-in client url if missing)?
 * @param entries An array (also accepts string, if only one item) of Entry names for React4xp components, for which we want to build the set
 * of dependencies.
 * @returns an object ready to be returned as a pageContributions.js from an XP component. Puts dependencies into the bodyEnd attribute. */
export function buildPageContributions({
	entries,
	suppressJS,
}: {
	entries: OneOrMore<React4xpNamespace.EntryName>,
	suppressJS: boolean,
}) {

	const pageContributions :PageContributions = {
		headEnd: [] // Lighthouse recommends meta charset in first 1024 bytes, thus we use headEnd not headBegin
	};

	// https://www.growingwiththeweb.com/2014/02/async-vs-defer-attributes.html
	// * If the script is modular and does not rely on any scripts then use async.
	// * If the script relies upon or is relied upon by another script then use defer.

	if (app.config['react4xp.serveGlobals'] !== 'false') {
		pageContributions.headEnd.push(`<script defer src="${getGlobalsUrls()}"></script>\n`);
	}

	const componentChunkUrls = getComponentChunkUrls(entries);
	for (let i = 0; i < componentChunkUrls.length; i++) {
		const componentChunkUrl = componentChunkUrls[i];
		if (endsWith(componentChunkUrl, '.css')) {
			pageContributions.headEnd.push(`<link href="${componentChunkUrl}" rel="stylesheet" type="text/css" />\n`);
		} else if(!suppressJS) { // Treat other dependencies as JS and add them in a script tag. Unless suppressJS, in which case: skip them.
			pageContributions.headEnd.push(`<script defer src="${componentChunkUrl}"></script>\n`);
		}
	}

	if (!suppressJS) {
		pageContributions.headEnd.push(`<script defer src="${getClientUrl()}"></script>\n`);
	}

	return pageContributions;
} // buildPageContributions
