import type {
	OneOrMore,
	PageContributions,
	React4xp as React4xpNamespace,
	// Request
} from '/types';
import type {Content} from '/lib/xp/portal';

import {includes as arrayIncludes} from '@enonic/js-utils/array/includes';
import endsWith from '@enonic/js-utils/string/endsWith';
import { toStr } from '@enonic/js-utils/value/toStr';
import {getClientUrl} from '/lib/enonic/react4xp/asset/client/getClientUrl';
import {getGlobalsUrls} from '/lib/enonic/react4xp/asset/globals/getGlobalsUrls';
import {getComponentChunkUrls} from '/lib/enonic/react4xp/dependencies/getComponentChunkUrls';
import {
	getResource,
	readText,
} from '/lib/xp/io';
import {getContent} from '/lib/xp/portal';


const RESOURCE_KEY = Java.type('com.enonic.xp.resource.ResourceKey');


function anEntryFoundInAReact4xpApplication({
	applicationKey,
	appNameToEntries,
	entries,
}: {
	applicationKey: string,
	appNameToEntries: Record<string,string[]>
	entries: OneOrMore<React4xpNamespace.EntryName>
}) {
	if (!appNameToEntries[applicationKey]) {
		const filePath = '/r4xAssets/entries.json';
		const resourcePath = `${applicationKey}:${filePath}`;
		const resource = getResource(RESOURCE_KEY.from(resourcePath));
		if (resource.exists()) {
			// log.debug('React4xp buildPageContributions: applicationKey:%s is a React4xp app.', applicationKey);
			const resourceJson = readText(resource.getStream());
			try {
				const entriesFromResource = JSON.parse(resourceJson) as string[];
				appNameToEntries[applicationKey] = entriesFromResource;
				log.debug('React4xp buildPageContributions: entriesFromResource:%s', toStr(entriesFromResource));
			} catch (e) {
				log.error(`Something went wrong while parsing resource path:${resourcePath} json:${resourceJson}!`, e);
				return false; // When something goes wrong, we assume it's not a React4xp app, nor an entry.
			}
		}
	}
	for (let i = 0; i < entries.length; i++) {
		const entry = entries[i];
		if (arrayIncludes(appNameToEntries[applicationKey], entry)) {
			return true;
		}
	}
	return false;
}


function thisEntryBelongsToTheFirstReact4xpAppOnThePage({
	content,
	entries,
}: {
	content: Content,
	entries: OneOrMore<React4xpNamespace.EntryName>,
}) {
		const appNameToEntries: Record<string,string[]> = {};
		// log.debug('React4xp buildPageContributions: content:%s', toStr(content));
		const {
			page: {
				descriptor: pageDescriptor,
			}
		} = content;
		const [pageApplicationKey] = pageDescriptor.split(':');
		if (anEntryFoundInAReact4xpApplication({
			applicationKey: pageApplicationKey,
			appNameToEntries,
			entries
		})) {
			// The application of the page is a React4xp app.
			// This entry is in that App's entries.json
			if (pageApplicationKey === app.name) {
				log.debug('React4xp buildPageContributions: This page: %s is in this app:%s', pageDescriptor, pageApplicationKey);
				return true;
			}

			// But this app is not the same as the app of the page.
			return false;
		}

		// check regions
		const {
			page: {
				regions: pageRegions
			}
		} = content;
		Object.keys(pageRegions).forEach((regionName) => {
			const {
				components: pageComponents
			} = pageRegions[regionName];
			pageComponents.forEach((layoutOrPartOrFragmentComponent) => {
				const {
					descriptor: layoutOrPartOrFragmentDescriptor,
					regions: layoutRegions,
					type,
				} = layoutOrPartOrFragmentComponent;
				const [layoutOrPartOrFragmentApplicationKey] = layoutOrPartOrFragmentDescriptor.split(':');
				if (anEntryFoundInAReact4xpApplication({
					applicationKey: layoutOrPartOrFragmentApplicationKey,
					appNameToEntries,
					entries
				})) {
					if (layoutOrPartOrFragmentApplicationKey === app.name) {
						// The application of the layoutOrPartOrFragment is a React4xp app.
						// This entry is in that App's entries.json
						log.debug('React4xp buildPageContributions: This layoutOrPartOrFragment: %s is in this app:%s', layoutOrPartOrFragmentDescriptor, layoutOrPartOrFragmentApplicationKey);
						return true;
					}
					// But this app is not the same as the app of the layoutOrPartOrFragment.
					return false;
				}

				if (type === 'layout') {
					Object.keys(layoutRegions).forEach((layoutRegionName) => {
						const {
							components: layoutComponents
						} = layoutRegions[layoutRegionName];
						layoutComponents.forEach((partOrFragmentComponent) => {
							const {
								descriptor: partOrFragmentDescriptor,
							} = partOrFragmentComponent;
							const [partOrFragmentApplicationKey] = partOrFragmentDescriptor.split(':');
							if (anEntryFoundInAReact4xpApplication({
								applicationKey: partOrFragmentApplicationKey,
								appNameToEntries,
								entries
							})) {
								if (partOrFragmentApplicationKey === app.name) {
									// The application of the partOrFragment is a React4xp app.
									// This entry is in that App's entries.json
									log.debug('React4xp buildPageContributions: This partOrFragment: %s is in this app:%s', partOrFragmentDescriptor, partOrFragmentApplicationKey);
									return true;
								}
								// But this app is not the same as the app of the partOrFragment.
								return false;
							}
						});
					});
				} // layout
			}); // pageComponents
		}); // pageRegions
		return false;
}

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
	// log.debug('React4xp buildPageContributions: entries:%s', toStr(entries));

	const pageContributions: PageContributions = {
		headEnd: [] // Lighthouse recommends meta charset in first 1024 bytes, thus we use headEnd not headBegin
	};

	const content = getContent();
	const serveGlobals = content
		? thisEntryBelongsToTheFirstReact4xpAppOnThePage({
			content,
			entries,
		})
		: true;

	if (serveGlobals) {
		// https://www.growingwiththeweb.com/2014/02/async-vs-defer-attributes.html
		// * If the script is modular and does not rely on any scripts then use async.
		// * If the script relies upon or is relied upon by another script then use defer.
		if (app.config['react4xp.serveGlobals'] !== 'false') {
			pageContributions.headEnd.push(`<script defer src="${getGlobalsUrls()}"></script>\n`);
		}
	}

	const componentChunkUrls = getComponentChunkUrls(entries);
	for (let i = 0; i < componentChunkUrls.length; i++) {
		const componentChunkUrl = componentChunkUrls[i];
		if (endsWith(componentChunkUrl, '.css')) {
			// Trailing slash on void elements is a warning in HTML5, but an error in XHTML!
			// Since we don't control DOCTYPE, it's better to keep the validation warning, than breaking a XHTML page.
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
