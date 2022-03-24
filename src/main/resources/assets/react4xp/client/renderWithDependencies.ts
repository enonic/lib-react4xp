import type {Entries} from './index.d';


import {loadScripts} from './loadScripts';
import {runEntryCalls} from './runEntryCalls';


/** Takes an object entriesWithTargetIdsAndProps where the keys are entry names (jsxPath) and the values are
 * objects with a mandatory targetId attribute and an optional props attribute - which is a regular object of any shape.
 * Uses the entry names and the React4xp runtime to figure out urls for all necessary dependencies for rendering all the
 * entries, then loads and runs the dependencies, loads and runs the entry component scripts and finally triggers the
 * rendering of the entries - in the order of the entry name keys in the entriesWithTargetIdsAndProps parameter.
 * @param entriesWithTargetIdsAndProps Mandatory object, { <entryName> -> { targetId: string, props: { ... react props for the entry}}}
 * @param callback Optional function called after the entire call chain.
 * @param serviceUrlRoot Root of the URL to the react4xp and react4xp-dependencies services. E.g. if they have the URLs
 * /_/service/my.app/react4xp/ and /_/service/my.app/react4xp-dependencies/, then serviceRootUrl should be /_/service/my.app (without
 * a trailing slash). Optional, sort of: you can define the constant SERVICE_URL_ROOT in global namespace and skip it. If you don't,
 * it's mandatory. */
export function renderWithDependencies(
  entriesWithTargetIdsAndProps :Entries,
  callback :()=>void,
  serviceUrlRoot :string
) {
  const entries = Object.keys(entriesWithTargetIdsAndProps) || [];

  const entryNames = entries
    .map((name) => `${name || ""}`.trim())
    .filter((name) => name !== "");

  let localServiceUrlRoot = serviceUrlRoot; // avoid no-param-reassign

  if (entryNames.length > 0) {
    /*if (!localServiceUrlRoot) {
      if (typeof SERVICE_URL_ROOT === "undefined") {
        throw new Error(
          "Missing service URL root. Include it as a last argument " +
            "or set a global variable constant SERVICE_URL_ROOT before calling renderWithDependencies."
        );
      }
      localServiceUrlRoot = SERVICE_URL_ROOT;
  	}*/

    fetch(`${localServiceUrlRoot}/react4xp-dependencies?${entryNames.join("&")}`)
      .then((data) => data.json())
      .then((dependencyUrls) => {
        loadScripts(dependencyUrls, () => {
          loadScripts(
            entryNames.map((name) => `${localServiceUrlRoot}/react4xp/${name}.js`),
            () =>
              runEntryCalls(entriesWithTargetIdsAndProps, entryNames, callback)
          );
        });
      })
      .catch((error) => {
        console.error(error);
      });
  }
}
