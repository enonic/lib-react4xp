import type {
	ScriptElement,
	StyleElement
} from './index.d';


/** Adjusted version of https://www.oreilly.com/library/view/high-performance-javascript/9781449382308/ch01.html#I_programlisting1_d1e1051
 * in order to parallelly load internally independent scripts from multiple urls, and only when they've ALL completely loaded
 * and run, run the callback.
 * @param urls Mandatory array (or single string) of urls to load as scripts and run
 * @param callback Optional function to run once all scripts are complete */
export function loadScripts(
	urls :Array<string>,
	callback :()=>void
) {
  let scriptsToComplete = 0;

  function maybeCallback() {
    scriptsToComplete -= 1;
    if (scriptsToComplete < 1 && typeof callback === "function") {
      callback();
    }
  }

  if (Array.isArray(urls) && urls.length === 0) {
    maybeCallback();
    return;
  }

  // Prevents a lot of bad input in one check (after handling an empty url array above): prevents it if url is missing,
  // null, an empty or only-spaces string, or an array where none of the items contain characters other than spaces
  if (`${urls || ""}`.replace(/,/g, "").trim() === "") {
    console.error(
      `Aborting: malformed 'urls' argument (all empty): ${JSON.stringify(urls)}`
    );
    return;
  }

  if (typeof urls === "string") {
    urls = [urls];
  }

  // Trim each url, and remove the duplicates and empty items
  urls = urls.map((url) => (url || "").trim());
  urls = urls.filter((url, index) => url !== "" && urls.indexOf(url) === index);

  scriptsToComplete = urls.length;

  try {
    urls.forEach((url) => {
      // console.debug('url', url);
      if (url.toLowerCase().endsWith(".css")) {
        const styles = document.createElement("link") as Partial<StyleElement>;
        styles.rel = "stylesheet";
        styles.type = "text/css";

        if (styles.readyState) {
          // IE
          styles.onreadystatechange = () => {
            if (
              styles.readyState === "loaded" ||
              styles.readyState === "complete"
            ) {
              styles.onreadystatechange = null;
              maybeCallback();
            }
          };
        } else {
          // Others
          styles.onload = maybeCallback;
        }

        styles.href = url;
        document.getElementsByTagName("head")[0].appendChild(styles as StyleElement);
      } else if (url.toLowerCase().endsWith(".js")) {
        try {
          const script = document.createElement("script") as Partial<ScriptElement>;
          script.type = "text/javascript";

          if (script.readyState) {
            // IE
            script.onreadystatechange = () => {
              if (
                script.readyState === "loaded" ||
                script.readyState === "complete"
              ) {
                script.onreadystatechange = null;
                maybeCallback();
              }
            };
          } else {
            // Others
            script.onload = maybeCallback;
          }

          script.src = url;
          document.getElementsByTagName("head")[0].appendChild(script as ScriptElement);
        } catch (e) {
          throw new Error(
            `Error occurred while trying to load script from url [ ${url} ]: ${e.message}`
          );
        }
      } else {
        console.error(
          "Unexpected asset type:",
          url,
          "\n\nreact4xp.CLIENT.renderWithDependencies will currently only " +
            "handle chunks (secondary assets) of type .JS and .CSS, see https://github.com/enonic/lib-react4xp/issues/103"
        );
        maybeCallback();
      }
    });
  } catch (e) {
    console.error(`Aborted - ${e.message}`);
  }
}
