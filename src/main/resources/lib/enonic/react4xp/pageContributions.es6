const utilLib = require("/lib/util");

const cacheLib = require("/lib/cache");
const pageContributionsCache = cacheLib.newCache({
  size: 750,
  expire: 10800 // 30 hours
});

const { normalizeEntryNames, getAllUrls } = require("./dependencies");

/** Wraps a url in a script tag and appends it to pageContributions.js.bodyEnd with an async tag. The reason for choosing
 *  bodyEnd is that this allows display of server-side-rendered content or placeholders before starting to load the
 *  acrtive components. The component-render-triggering <script> tag should have a defer attribute in order to wait for
 *  these to load. */
const appendToBodyEnd = (url, pageContributions) => {
  pageContributions.bodyEnd = [
    ...(pageContributions.bodyEnd || []),
    `<script src="${url}" ></script>\n`
  ];
};

const appendCss = (url, pageContributions) => {
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
const buildPageContributions = entries => {
  const chunkUrls = getAllUrls(entries);

  const pageContributions = {};
  chunkUrls.forEach(chunkUrl => {
    if (chunkUrl.endsWith(".css")) {
      appendCss(chunkUrl, pageContributions);
    } else {
      appendToBodyEnd(chunkUrl, pageContributions);
    }
  });

  return pageContributions;
};

// ---------------------------------------------------------------

const getUniqueEntries = (arrayOfArrays, controlSet) => {
  const uniqueEntries = [];
  arrayOfArrays.forEach(arr => {
    utilLib.data.forceArray(arr).forEach(item => {
      if (controlSet.indexOf(item) === -1) {
        uniqueEntries.push(item);
        controlSet.push(item);
      }
    });
  });
  return uniqueEntries;
};

/** Adds page contributions for an (optional) set of entries.  Merges different pageContributions.js objects into one. Prevents duplicates: no single pageContribution entry is
 * repeated, this prevents resource-wasting by loading/running the same script twice).
 *
 * @param incomingPgContrib incoming pageContributions.js (from other components / outside / previous this rendering)
 * @param newPgContrib pageContributions.js that this specific component will add.
 *
 * Also part of the merge: PAGE_CONTRIBUTIONS, the common standard React4xp page contributions
 */
const getAndMergePageContributions = (
  entryNames,
  incomingPgContrib,
  newPgContrib
) => {
  entryNames = normalizeEntryNames(entryNames);
  const entriesPgContrib = pageContributionsCache.get(
    entryNames.join("*"),
    () => buildPageContributions(entryNames)
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

// ------------------------------------------------------------------

module.exports = {
  getAndMergePageContributions
};
