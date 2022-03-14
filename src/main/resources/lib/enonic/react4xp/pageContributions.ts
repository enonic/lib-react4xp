import type {
	OneOrMore,
	PageContributions,
	React4xp as React4xpNamespace
} from '../../../index.d';


//import {forceArray} from '@enonic/js-utils';
import {forceArray} from '@enonic/js-utils/array/forceArray';
//import {toStr} from '@enonic/js-utils/value/toStr';
//@ts-ignore
import {newCache} from '/lib/cache';

import {
	normalizeEntryNames,
	getAllUrls,
	getSiteLocalCacheKey
} from './dependencies';


const pageContributionsCache = newCache({
  size: 1200,
  expire: 10800 // 30 hours
});


/** Wraps a url in a script tag and appends it to pageContributions.js.bodyEnd with an async tag. The reason for choosing
 *  bodyEnd is that this allows display of server-side-rendered content or placeholders before starting to load the
 *  acrtive components. The component-render-triggering <script> tag should have a defer attribute in order to wait for
 *  these to load. */
function appendScriptToBodyEnd(
	url :string,
	pageContributions :PageContributions
) {
  pageContributions.bodyEnd = [
    ...(pageContributions.bodyEnd || []),
    `<script src="${url}"></script>\n`
  ];
};

function appendCssToHeadEnd(
	url :string,
	pageContributions :PageContributions
) {
  pageContributions.headEnd = [
    ...(pageContributions.headEnd || []),
    `<link href="${url}" rel="stylesheet" type="text/css" />\n`
  ];
};

/** Use the json files built by webpack in other libraries (react4xp-build-components, react4xp-runtime-externals, react4xp-runtime-client)
 *  to fetch items of <script src="url" /> for common chunks:
 *   -the dependency chunks of specific entries (array of entry names in the argument, gets all of the dependencies if empty),
 *   -an optional Externals chunk,
 *   -and an optional frontend-client chunk (which falls back to the built-in client url if missing)?
 * @param entries An array (also accepts string, if only one item) of Entry names for React4xp components, for which we want to build the set
 * of dependencies.
 * @returns an object ready to be returned as a pageContributions.js from an XP component. Puts dependencies into the bodyEnd attribute. */
function buildPageContributions(
	entries :OneOrMore<React4xpNamespace.EntryName>,
	suppressJS :boolean
) {
	//log.debug('buildPageContributions() entries:%s', toStr(entries));

	const chunkUrls = getAllUrls(entries, suppressJS); // This is where the clientwrapper comes in...
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


// ---------------------------------------------------------------


function getUniqueEntries(
	arrayOfArrays :Array<Array<string>>,
	controlSet :Array<string>
) {
  const uniqueEntries = [];
  arrayOfArrays.forEach(arr => {
    forceArray(arr).forEach(item => {
      if (controlSet.indexOf(item) === -1) {
        uniqueEntries.push(item);
        controlSet.push(item);
      }
    });
  });
  return uniqueEntries;
}


/** Adds page contributions for an (optional) set of entries.  Merges different pageContributions.js objects into one. Prevents duplicates: no single pageContribution entry is
 * repeated, this prevents resource-wasting by loading/running the same script twice).
 *
 * @param incomingPgContrib incoming pageContributions.js (from other components / outside / previous this rendering)
 * @param newPgContrib pageContributions.js that this specific component will add.
 * @param suppressJS If truthy, any JS assets are skipped
 *
 * Also part of the merge: PAGE_CONTRIBUTIONS, the common standard React4xp page contributions
 */
export function getAndMergePageContributions(
  entryNames :OneOrMore<React4xpNamespace.EntryName>,
  incomingPgContrib :PageContributions,
  newPgContrib :PageContributions,
  suppressJS :boolean
) :PageContributions {
	//log.debug('getAndMergePageContributions() entryNames:%s', toStr(entryNames));
	//log.debug('getAndMergePageContributions() incomingPgContrib:%s', toStr(incomingPgContrib));
	//log.debug('getAndMergePageContributions() newPgContrib:%s', toStr(newPgContrib));
	//log.debug('getAndMergePageContributions() suppressJS:%s', toStr(suppressJS));

  	entryNames = normalizeEntryNames(entryNames);
  	//log.debug('getAndMergePageContributions() normalized entryNames:%s', toStr(entryNames));

    const cacheKey = getSiteLocalCacheKey(entryNames.join("*")+"_"+suppressJS);
	//log.debug('getAndMergePageContributions() cacheKey:%s', toStr(cacheKey));

    const entriesPgContrib :PageContributions = pageContributionsCache.get(
        cacheKey, () => buildPageContributions(entryNames, suppressJS)
	);

	if (!incomingPgContrib && !newPgContrib) {
		return entriesPgContrib;
	}
	incomingPgContrib = incomingPgContrib || {};
	newPgContrib = newPgContrib || {};

	// Keeps track of already-added entries across headBegin, headEnd, bodyBegin and bodyEnd
	const controlSet = [];

	return {
		headBegin: getUniqueEntries(
			[
				entriesPgContrib.headBegin,
				incomingPgContrib.headBegin,
				newPgContrib.headBegin
			],
			controlSet
		),
		headEnd: getUniqueEntries(
			[
				entriesPgContrib.headEnd,
				incomingPgContrib.headEnd,
				newPgContrib.headEnd
			],
			controlSet
		),
		bodyBegin: getUniqueEntries(
			[
				entriesPgContrib.bodyBegin,
				incomingPgContrib.bodyBegin,
				newPgContrib.bodyBegin
			],
			controlSet
		),
		bodyEnd: getUniqueEntries(
			[
				entriesPgContrib.bodyEnd,
				incomingPgContrib.bodyEnd,
				newPgContrib.bodyEnd
			],
			controlSet
		)
	};
};
