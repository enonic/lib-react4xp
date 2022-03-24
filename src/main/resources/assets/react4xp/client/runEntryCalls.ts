import type {Entries} from './index.d';


import {LIBRARY_NAME} from './constants';


/** After all the dependency and entry source scripts have been loaded and run, it's time to add a script tag that calls
 * the render method on each entry, and finally runs the callback */
export function runEntryCalls(
	entriesWithTargetIdsAndProps :Entries,
	entryNames :Array<string>,
	callback :()=>void
) {
  const script = document.createElement("script");
  script.type = "text/javascript";

  let inlineScript = "\n";
  entryNames.forEach((entryName) => {
    const trimmedEntryName = (entryName || "").trim();
    if (trimmedEntryName === "") {
      return;
    }

    inlineScript +=
      `${LIBRARY_NAME}.CLIENT.render(${LIBRARY_NAME}['${trimmedEntryName}'], ` +
      `${JSON.stringify(entriesWithTargetIdsAndProps[entryName].targetId)}, ` +
      `${JSON.stringify(entriesWithTargetIdsAndProps[entryName].props)});\n`;
  });

  if (typeof callback === "function") {
    inlineScript += `(${callback.toString()})();\n`;
  }

  script.appendChild(document.createTextNode(inlineScript));
  document.getElementsByTagName("head")[0].appendChild(script);
}
