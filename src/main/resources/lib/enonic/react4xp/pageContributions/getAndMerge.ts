import type {
	OneOrMore,
	PageContributions,
	React4xp as React4xpNamespace
} from '../../../../index.d';


import {getExecutorUrl} from '/lib/enonic/react4xp/asset/executor/getExecutorUrl';
import {getSiteLocalCacheKey} from '/lib/enonic/react4xp/asset/getSiteLocalCacheKey';
import {normalizeEntryNames} from '/lib/enonic/react4xp/dependencies/normalizeEntryNames';
import {buildPageContributions} from '/lib/enonic/react4xp/pageContributions/buildPageContributions';
import {getUniqueEntries} from '/lib/enonic/react4xp/pageContributions/getUniqueEntries';

//@ts-ignore
import {newCache} from '/lib/cache';


const pageContributionsCache = newCache({
  size: 1200,
  expire: 10800 // 30 hours
});


/** Adds page contributions for an (optional) set of entries.  Merges different pageContributions.js objects into one. Prevents duplicates: no single pageContribution entry is
 * repeated, this prevents resource-wasting by loading/running the same script twice).
 *
 * @param incomingPgContrib incoming pageContributions.js (from other components / outside / previous this rendering)
 * @param newPgContrib pageContributions.js that this specific component will add.
 * @param suppressJS If truthy, any JS assets are skipped
 *
 * Also part of the merge: PAGE_CONTRIBUTIONS, the common standard React4xp page contributions
 */
export function getAndMerge({
  entryNames,
  incomingPgContrib,
  newPgContrib,
  suppressJS,
  serveExternals = true
} :{
	entryNames :OneOrMore<React4xpNamespace.EntryName>
    incomingPgContrib :PageContributions
    newPgContrib :PageContributions
    suppressJS :boolean
    serveExternals? :boolean
}) :PageContributions {
	//log.debug('getAndMerge() entryNames:%s', toStr(entryNames));
	//log.debug('getAndMerge() incomingPgContrib:%s', toStr(incomingPgContrib));
	//log.debug('getAndMerge() newPgContrib:%s', toStr(newPgContrib));
	//log.debug('getAndMerge() suppressJS:%s', toStr(suppressJS));

  	entryNames = normalizeEntryNames(entryNames);
  	//log.debug('getAndMerge() normalized entryNames:%s', toStr(entryNames));

    const cacheKey = getSiteLocalCacheKey(entryNames.join("*")+"_"+suppressJS);
	//log.debug('getAndMerge() cacheKey:%s', toStr(cacheKey));

    const entriesPgContrib :PageContributions = pageContributionsCache.get(
        cacheKey, () => buildPageContributions({
			entries: entryNames,
			suppressJS,
			serveExternals
		})
	);

	if (!incomingPgContrib && !newPgContrib) {
		return entriesPgContrib;
	}
	incomingPgContrib = incomingPgContrib || {};
	newPgContrib = newPgContrib || {};

	const executorEntry = `<script defer src="${getExecutorUrl()}"></script>\n`;

	// Keeps track of already-added entries across headBegin, headEnd, bodyBegin and bodyEnd
	const controlSet = [
		executorEntry // Skip until manually added, must be last...
	];

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
		).concat(suppressJS ? [] : executorEntry) // Manually added last :)
	};
};
