const {getAndMergePageContributions} = require('./pageContributions');
const {getComponentChunkNames} = require('./dependencies');
const {getAssetRoot} = require('./serviceRoots');
const {getContent, getComponent} = require('/lib/xp/portal');
const {newCache} = require('/lib/cache');
const contentLib = require('/lib/xp/content');

const HTMLinserter = __.newBean('com.enonic.lib.react4xp.HtmlInserter');
const SSRreact4xp = __.newBean('com.enonic.lib.react4xp.ssr.ServerSideRenderer');

const SSR_DEFAULT_CACHE_SIZE = 1000;


                                                                                                                                                            const prettify = (obj, label, suppressCode = false, indent = 0) => {
                                                                                                                                                                let str = " ".repeat(indent) + (
                                                                                                                                                                    label !== undefined
                                                                                                                                                                        ? label + ": "
                                                                                                                                                                        : ""
                                                                                                                                                                );

                                                                                                                                                                if (typeof obj === 'function') {
                                                                                                                                                                    if (!suppressCode) {
                                                                                                                                                                        return `${str}···· (function)\n${" ".repeat(indent + 4)}` +
                                                                                                                                                                            obj.toString()
                                                                                                                                                                                .replace(
                                                                                                                                                                                    /\r?\n\r?/g,
                                                                                                                                                                                    `\n${" ".repeat(indent + 4)}`
                                                                                                                                                                                ) +
                                                                                                                                                                            "\n" + " ".repeat(indent) + "····"
                                                                                                                                                                            ;
                                                                                                                                                                    } else {
                                                                                                                                                                        return `${str}···· (function)`;
                                                                                                                                                                    }

                                                                                                                                                                } else if (Array.isArray(obj)) {
                                                                                                                                                                    return obj.length === 0
                                                                                                                                                                        ? `${str}[]`
                                                                                                                                                                        : (
                                                                                                                                                                            `${str}[\n` +
                                                                                                                                                                            obj.map(
                                                                                                                                                                                (item, i) =>
                                                                                                                                                                                    prettify(item, i, suppressCode, indent + 4)
                                                                                                                                                                            )
                                                                                                                                                                                .join(",\n") +
                                                                                                                                                                            `\n${" ".repeat(indent)}]`
                                                                                                                                                                        );

                                                                                                                                                                } else if (obj && typeof obj === 'object') {
                                                                                                                                                                    try {
                                                                                                                                                                        if (Object.keys(obj).length === 0) {
                                                                                                                                                                            return `${str}{}`;
                                                                                                                                                                        } else {
                                                                                                                                                                            return `${str}{\n` +
                                                                                                                                                                                Object.keys(obj).map(
                                                                                                                                                                                    key => prettify(obj[key], key, suppressCode, indent + 4)
                                                                                                                                                                                ).join(",\n") +
                                                                                                                                                                                `\n${" ".repeat(indent)}}`
                                                                                                                                                                        }
                                                                                                                                                                    } catch (e) {
                                                                                                                                                                        log.info(e);
                                                                                                                                                                        return `${str}···· (${typeof obj})\n${" ".repeat(indent + 4)}` +
                                                                                                                                                                            obj.toString()
                                                                                                                                                                                .replace(
                                                                                                                                                                                    /\r?\n\r?/g,
                                                                                                                                                                                    `\n${" ".repeat(indent + 4)}`
                                                                                                                                                                                ) +
                                                                                                                                                                            "\n" + " ".repeat(indent) + `····`;
                                                                                                                                                                    }
                                                                                                                                                                } else if (obj === undefined || obj === null) {
                                                                                                                                                                    return `${str}${obj}`;
                                                                                                                                                                } else if (JSON.stringify(obj) !== undefined) {
                                                                                                                                                                    return `${str}` + JSON.stringify(obj, null, 2).replace(
                                                                                                                                                                        /\r?\n\r?/g,
                                                                                                                                                                        `\n${" ".repeat(indent + 2)}`
                                                                                                                                                                    );
                                                                                                                                                                } else {
                                                                                                                                                                    return `${str}···· (${typeof obj})\n${" ".repeat(indent + 4)}` +
                                                                                                                                                                        obj.toString()
                                                                                                                                                                            .replace(
                                                                                                                                                                                /\r?\n\r?/g,
                                                                                                                                                                                `\n${" ".repeat(indent + 4)}`
                                                                                                                                                                            ) +
                                                                                                                                                                        "\n" + " ".repeat(indent) + `····`;
                                                                                                                                                                }
                                                                                                                                                            };


// react4xp_constants.json is not part of lib-react4xp:
// it's an external shared-constants file expected to exist in the build directory of this index.es6.
// Easiest: use <projectRoot>/react4xp.properties and the build.gradle from https://www.npmjs.com/package/react4xp
const {
    LIBRARY_NAME,
    R4X_TARGETSUBDIR,
    NASHORNPOLYFILLS_FILENAME,
    EXTERNALS_CHUNKS_FILENAME,
    COMPONENT_STATS_FILENAME,
    ENTRIES_FILENAME,
    BUILD_ENV,
    SSR_LAZYLOAD,                   // <-- lazyLoading main switch
    SSR_ENGINE_SETTINGS             // <-- set to 0 to switch off cache size
} = require("./react4xp_constants.json");

                                                                                                                        log.info(prettify({
                                                                                                                            LIBRARY_NAME,
                                                                                                                            R4X_TARGETSUBDIR,
                                                                                                                            NASHORNPOLYFILLS_FILENAME,
                                                                                                                            EXTERNALS_CHUNKS_FILENAME,
                                                                                                                            COMPONENT_STATS_FILENAME,
                                                                                                                            ENTRIES_FILENAME,
                                                                                                                            BUILD_ENV,
                                                                                                                            SSR_LAZYLOAD,                   // <-- lazyLoading main switch
                                                                                                                            SSR_ENGINE_SETTINGS             // <-- set to 0 to switch off cache size
                                                                                                                        }, "./react4xp_constants.json"))
/** Normalize engine settings to string array */
const normalizeSSREngineSettings = (ssrEngineSettingsString) => {

    // 0. --------- Internal helpers:

    const COMMA_PLACEHOLDER = "##U+FE10##";

    // When iterating over strings, flags whether a character is inside a quote or not:
    const isInsideQuote = {
        "'": false,
        '"': false
    };

    const singleQuoteCounter = item => (item.match(/'/g) || []).length;
    const replaceSurroundingSingleQuotes = item => (item.startsWith("'"))
        ? item.replace(/^'/, "").replace(/'$/, "").trim()
        : item.trim();
    const doubleQuoteCounter = item => (item.match(/"/g) || []).length;
    const replaceSurroundingDoubleQuotes = item => (item.startsWith('"'))
        ? item.replace(/^"/, "").replace(/"$/, "").trim()
        : item.trim();


    const isQuoteSoMaybeFlagAsInside = (char, c, targetQuote, otherQuote) => {
        if (char === targetQuote) {
            if (isInsideQuote[targetQuote]) {
                if (c > 0 && ssrEngineSettings[c - 1] !== "\\") {
                    isInsideQuote[targetQuote] = false;
                }
            } else if (!isInsideQuote[otherQuote]) {
                isInsideQuote[targetQuote] = true;
            }
            return true;
        }
        return false;
    };


    const preventUnclosedQuotes = (item) => {
        isInsideQuote['"'] = false;
        isInsideQuote["'"] = false;
        for (let c = 0; c < item.length; c++) {
            const char = item[c];
            isQuoteSoMaybeFlagAsInside(char, c, '"', "'") ||
            isQuoteSoMaybeFlagAsInside(char, c, "'", '"');
        }
        if (isInsideQuote["'"] || isInsideQuote['"']) {
            throw Error("Malformed SSR engine setting item: " + item);
        }
        return item;
    };


    // 1. ------------ If the entire multi-setting-items-stringis surrounded by a single set of double (or single) quotes, strip that away.

    let ssrEngineSettings = ((ssrEngineSettingsString || SSR_DEFAULT_CACHE_SIZE) + "").trim();

    if (ssrEngineSettings.endsWith("'") && singleQuoteCounter(ssrEngineSettings) === 2) {
        ssrEngineSettings = replaceSurroundingSingleQuotes(ssrEngineSettings);
    }
    if (ssrEngineSettings.endsWith('"') && doubleQuoteCounter(ssrEngineSettings) === 2) {
        ssrEngineSettings = replaceSurroundingDoubleQuotes(ssrEngineSettings);
    }



    // 2. The settings string should be split into items on commas, but not on commas that are inside per-item quotes (that still remain after previous step).
    //      So replace those commas with a placeholder before splitting, and re-insert them after splitting.
    for (let c = 0; c < ssrEngineSettings.length; c++) {
        const char = ssrEngineSettings[c];
        if (
            !isQuoteSoMaybeFlagAsInside(char, c, '"', "'") &&
            !isQuoteSoMaybeFlagAsInside(char, c, "'", '"') &&
            (char === ',' && (isInsideQuote['"'] || isInsideQuote["'"]))
        ) {
            ssrEngineSettings = ssrEngineSettings.substring(0, c) + COMMA_PLACEHOLDER + ssrEngineSettings.substring(c + 1);
            c += COMMA_PLACEHOLDER.length - 1;
        }
    }
    if (isInsideQuote["'"] || isInsideQuote['"']) {
        throw Error("Malformed SSR engine settings: " + ssrEngineSettings);
    }


    // 3. Split the setting string into items, filter away empty items, trim away spaces or quotes that surround each item,
    //      and if any of them still has unclosed quotes, throw an error.
    return ssrEngineSettings
        .split(/\s*,\s*/)
        .map(item => ((item || '') + '').trim())
        .filter(item => !!item)
        .map(item => item.replace(COMMA_PLACEHOLDER, ","))
        .map(replaceSurroundingDoubleQuotes)
        .map(replaceSurroundingSingleQuotes)
        .map(preventUnclosedQuotes)
};

SSRreact4xp.setup(
    app.name,
    `/${R4X_TARGETSUBDIR}`,
    LIBRARY_NAME,
    `/${R4X_TARGETSUBDIR}/`,
    NASHORNPOLYFILLS_FILENAME ? `${NASHORNPOLYFILLS_FILENAME}.js` : null,
    ENTRIES_FILENAME,
    EXTERNALS_CHUNKS_FILENAME,
    COMPONENT_STATS_FILENAME,
    !!SSR_LAZYLOAD && SSR_LAZYLOAD !== 'false',
    normalizeSSREngineSettings(SSR_ENGINE_SETTINGS)
);

const BASE_PATHS = {
    part: "parts",
    page: "pages",
    layout: "layouts",
};

const templateDescriptorCache = newCache({
    size: 100,
    expire: 600 // 10 minutes before needing a new fetch-and-check from ES (getDescriptorFromTemplate)
});

const getDescriptorFromTemplate = (componentType, templateId) =>
    templateDescriptorCache.get(templateId, () => {
        if (!templateId) {
            log.warn(`Template ID is '${JSON.stringify(templateId)}'. Not ID of a template.`);
            return undefined;
        }
        if (componentType !== 'page') {
            log.warn(`Template ID '${templateId}' not accompanied by component type 'page' (component type is ${JSON.stringify(componentType)}).`);
            return undefined;
        }

        const content = contentLib.get({
            key: templateId
        });

        if (!content || content.type !== "portal:page-template") {
            log.warn(`Content not found or not a template (content.type!=="portal:page-template"). Template ID is '${JSON.stringify(templateId)}', retrieved content: ${JSON.stringify(content)}`);
            return undefined;
        }
        if (!content.page || content.page.type !== "page" || !(((content.page.descriptor || '') + '').trim())) {
            log.warn(`Template doesn't seem to have a page controller attached. Template ID is '${JSON.stringify(templateId)}', retrieved template content: ${JSON.stringify(content)}`);
            return undefined;
        }

        return content.page.descriptor;
    });


const bodyHasContainer = (body, react4xpId) => {
    const react4xpPattern = new RegExp("<[^>]+\\s+id\\s*=\\s*[\"']" + react4xpId + "[\"']", 'i');

    return !!body.match(react4xpPattern);
};


const buildContainer = (react4xpId, content) => `<div id="${react4xpId}">${content || ''}</div>`;

const buildErrorContainer = (heading, message, request, react4xpObj) => {
    const { jsxPath, react4xpId } = react4xpObj;
    if (message) log.error(message);

    let msg = (
        (!request || request.mode === 'live')
            ? ""
            : (message || "")
    );

    																													log.info(prettify(msg, "msg"));
    msg = msg
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    let protip = "";
    if (request) {
        protip = (request.mode === 'live')
            ? " or display this page in Content Studio"
            : '.<br/>' +
            '<strong>PROTIP!</strong> Some ways to make errors in compiled entries/assets easier to pinpoint: ' +
            '<ul><li>Rebuild your assets with react4xp development build mode, to make them more readable. Use react4xp.properties, or add this gradle CLI argument: -Pdev</li>' +
            '<li><a href="https://developer.enonic.com/docs/react4xp/master/hello-react#client_side_rendering" target="_blank">Clientside-render</a> the entry and view it outside of content studio (live or preview mode), then inspect the browser console.</li>' +
            '<li>If the entry renders fine in clientside mode, this is usually a sign that it (or something it imports) is trying to invoke purely-browser functionality (e.g. document- or window-functions etc), which is not available in SSR. ' +
            'Simple workaround: in those areas, check for typeof window === undefined or similar, to only use browser-specific functionality in the browser</li></ul>';
    }

    return `
    <div class="react4xp-error" style="border:1px solid #8B0000; padding:15px; background-color:#FFB6C1">
        <style>
            li,h2,p,a,strong,span { font-family:monospace; }
            h2 { font-size:20px }
            li,p,a,strong,span { font-size:13px }
            a,span.data { color:#8B0000; }
        </style>
        <h2 class="react4xp-error-heading">${heading}</h2>
        <p class="react4xp-error-message">${msg}</p>
        <div class="react4xp-error-entry">
           <p>
               <strong>React4xp entry:</strong><br/>
               <span class="jsxpath">JsxPath: <span class="data">${jsxPath}</span></span><br/>
               <span class="id" >ID: <span class="data">${react4xpId}</span></span>
           </p>
        </div>
        <div class="react4xp-error-protip"><p>For more details, see the server log${protip}</p></div>
    </div>`;
};


const makeErrorMessage = (attribute, component) => `Couldn't construct React4xp data: missing or invalid ${attribute}. ${
    this.isPage ?
        "Trying to handle a page controller template without a jsxPath string 'entry' parameter in the constructor - but that's usually okay. However, an in-construtor call to portal.getContent() returned data without a content.page." + attribute + " attribute, so no jsxPath can be derived. Content" :
        "No jsxPath string 'entry' parameter was given to the React4xp constructor - but that's usually okay. However, component data (either from the 'entry' parameter or from an in-constructor portal.getComponent() call) is missing a component." + attribute + " attribute, so no jsxPath can be derived. Component"
} data: ${JSON.stringify(component)}`;

//////////////////////////////////////////////////////////////////////

class React4xp {

    /** Mandatory constructor entry, one of two options (pseudo-overloaded function):
     * @param component {Object} If entry is an object: the portal.getComponent() object of the Enonic
     *      XP component (currently page or part) that the react component belongs to. XP and react components are found
     *      in the same folder (and the component object is used to extrapolate the resource path - jsxPath).
     *
     * @param jsxPath {String} If entry is a string: path to react component entry,
     *     relative to the folder where the transpiled (JS) react components are found - assets/react4xp. Overview of available entry
     *     paths is built to: build/resources/main/react4xp/entries.json.
     */
    constructor(entry) {
        this.react4xpId = null;
        this.jsxPath = null;
        this.component = null;
        this.props = null;

        this.isPage = 0;            // boolean using 0 for false and 1 for true, for the sake of more compact client-side .render and .hydrate calls.
        this.hasRegions = 0;        // boolean using 0 for false and 1 for true, for the sake of more compact client-side .render and .hydrate calls.
        this.react4xpIdIsLocked = false;

                                                                                                                        log.info(prettify(entry, "React4xp constructor"));

        if (typeof entry === 'string') {
            // Use jsxPath, regular flow
            this.jsxPath = entry.trim();

            //this.component = getComponent();

            if (this.jsxPath === "") {
                throw Error(`Can't initialize Reac4xp component with initParm = ${JSON.stringify(entry)}. XP component object or jsxPath string only, please.`);
            }

        } else if (!entry || (typeof entry === 'object' && !Array.isArray(entry))) {
            const comp = getComponent();
            if (comp) {
                // Component. Use entry in component flow. Derive jsxPath and default ID from local part/layout folder, same name.
                this.component = entry || comp;

            } else {
                const cont = getContent();
                if (cont && cont.page) {
                    // TODO: In the long run, it would be better with a more reliable test than !component for whether this is a top-level entry call specifically from a page controller.
                    //       Especially since page-view entries that are called from the controller by jsxPath instead of by component, will be unable to detect if its a page.
                    //       Make a Content.getPage() call from a bean? And if it fails, this fallback should be skipped since this wasn't called from a page controller.
                    // Page. Use content.page in page flow. Derive jsxPath and default ID from local page folder, same name.
                    this.isPage = 1;
                    this.component = cont.page;

                } else {
                    // Missing content.page.descriptor as well as component and jsxPath
                    throw Error("React4xp seems to be called from an invalid context. Looks like you tried to derive jsxPath from a non-jsxPath 'entry' parameter, using either a falsy or component object (portal.getComponent() called from a component controller, i.e. part, layout). But both in-constructor calls portal.getComponent() and portal.getContent() yielded invalid results: no component data and no content.page.  |  entry=" + JSON.stringify(entry) + "  |  portal.getComponent=" + JSON.stringify(comp) + "  |  portal.getContent=" + JSON.stringify(cont));
                }
            }


            const buildingBlockData = {
                descriptor: this.component.descriptor || getDescriptorFromTemplate(this.component.type, this.component.template),
                type: BASE_PATHS[this.component.type],
                path: this.component.path
            };
            Object.keys(buildingBlockData).forEach(attribute => {
                if (!buildingBlockData[attribute]) {
                    throw Error(makeErrorMessage(attribute, this.component));
                }
            });

            const compName = buildingBlockData.descriptor.split(":")[1];
            this.jsxPath = `site/${buildingBlockData.type}/${compName}/${compName}`;
            this.react4xpId = `${buildingBlockData.type}_${compName}_${buildingBlockData.path}`.replace(/\//g, "_");


            // TODO: Move to later in the flow. Where are regions relevant and this.component guaranteed?
            // ------------------------------------------------------------------------------------------
            if (this.component.regions && Object.keys(this.component.regions).length) {
                this.hasRegions = 1;
            } else if (this.isPage && BUILD_ENV === 'development') {
                log.warning("React4xp appears to be asked to render a page. No regions are found.  |  entry=" + JSON.stringify(entry) + "  |  portal.getComponent=" + JSON.stringify(getComponent()) + "  |  portal.getContent=" + JSON.stringify(getContent));
            }
            // ------------------------------------------------------------------------------------------


        } else {
            // Missing entry
            throw Error("React4xp got an invalid 'entry' reference. Either use falsy, a jsxPath string, or a component object (portal.getComponent() called from a component controller, i.e. part, layout). entry=" + JSON.stringify(entry));
        }
    }


    /** Inner initializer: returns a React4xp component instance initialized from a single set of parameters instead of
     *  the class approach.
     *  @param params {object} MUST include jsxPath or component. All other parameters are optional. If component is included, the jsxPath is automatically inserted to point to a JSX file in the XP component folder, with the same name. This file must exist. If component AND jsxPath are included, jsxPath will override the component name.
     *      - component {object} XP component object (used to extrapolate component part, sufficient if JSX entry file is in the same folder and has the same name).
     *      - jsxPath {string} path to react component entry, see available paths in build/main/resources/react4xp/entries.json after building. These are NAMES, not relative paths. So jsxPath can't contain '..', '//', '/./' or start with '.' or '/'.
     *      - props {object} react props sent in to the component
     *      - id {string} sets the target container element id. If this matches an ID in an input body, the react component will be rendered there. If not, a container with this ID will be added.
     *      - uniqueId {boolean|string} If set, ensures that the ID is unique. If id is set (previous param), a random integer will be postfixed to it. If uniqueId is a string, this is the prefix before the random postfix. If the id param is used in addition to a uniqueId string, uniqueId takes presedence and overrides id.
     */
    static _buildFromParams = (params) => {
        //log.info(prettify(react4xp, "React4xp._buildFromParams"));

        const {entry, id, uniqueId, props} = params || {};

        const react4xp = new React4xp(entry);

        if (props) {
            // TODO: Too much data in props. Consider stripping out unnecessary fields. Remember that props are exposed to client in pageContribution. Stop this?
            /* if (hasRegions && props && !props.component) {
                props.component = component;
            } */
            react4xp.setProps(props);
        }

        if (id) {
            react4xp.setId(id);
        }

        if (uniqueId) {
            if (typeof uniqueId === "string") {
                react4xp.setId(uniqueId);
            } else {
                react4xp.uniqueId();
            }
        }

                                                                                                                        log.info(prettify({
                                                                                                                            react4xpId: react4xp.react4xpId,
                                                                                                                            jsxPath: react4xp.jsxPath,
                                                                                                                            component: react4xp.component,
                                                                                                                            props: react4xp.props
                                                                                                                        }, "React4xp.builtFromParams"));

        return react4xp;
    };


    //---------------------------------------------------------------

    checkIdLock() {
        if (this.react4xpIdIsLocked) {
            throw Error("This component has already been used to generate a body or pageContributions.es6. " +
                "Container ID can't be changed now.");
        }
    }

    // For now, it seems like a good idea to ensure two things when starting the client side rendering:
    // 1, there is a target ID set.
    // 2, it can't be changed once the rendering has started, i.e. between render body and render pagecontributions
    ensureAndLockId() {
        if (!this.react4xpId) {
            this.uniqueId();
        }
        this.react4xpIdIsLocked = true;
        if (this.react4xpId && this.props) {
            this.props.react4xpId = this.react4xpId;
        }
    }

    ensureAndLockBeforeRendering() {
        this.ensureAndLockId();

        if (!this.jsxPath) {
            throw Error("Target path for JSX component, jsxPath, has not been set. Add an absolute path (or an XP component from which to derive it) in the React4XP constructor or with the setters.");
        }
        if (!this.react4xpId) {
            throw Error("ID for the target container element is missing.");
        }
    }

    //---------------------------------------------------------------

    /** Sets the react4xpId - the HTML ID of the target container this component will be rendered into.
     * Deletes the ID if argument is omitted.
     * @returns The react4xp component itself, for builder-like pattern.
     */
    setId(react4xpId) {
        this.checkIdLock();
        this.react4xpId = react4xpId;
        if (this.props) {
            this.props.react4xpId = react4xpId;
        }
        return this;
    }

    /** Appends a unique target container ID postfix after the currently set reactXpId (if any).
     * @returns The react4xp component itself, for builder-like pattern.
     */
    uniqueId() {
        return this.setId((this.react4xpId || "") + "_" + Math.floor(Math.random() * 99999999));
    }

    setIsPage(isPage) {
        this.isPage = isPage ? 1 : 0;
        return this;
    }

    setHasRegions(hasRegions) {
        this.hasRegions = hasRegions ? 1 : 0;
        return this;
    }


    //---------------------------------------------------------------

    /** When you want to use a particular JSX file (other than the default, a JSX file in the same folder as the XP component,
     * with the same name as the folder).
     *
     * @param jsxPath (string, mandatory) Name of a JSX file, will be interpreted as a full, absolute JSX path. NOTE
     *        that these are component NAME strings, not file paths that can be relative. So avoid stuff like "..", "//", "./", etc.
     *        After building the parent project with react4xp-build-components,
     *        the available entry jsxPaths can be seen in build/main/resources/react4xp/entries.json.
     *
     * @returns The React4xp object itself, for builder-like pattern.
     */
    setJsxPath(jsxPath) {
        // Enforce a clean jsxPath - it's not just a file reference, but a react4xp component name!
        this.checkIdLock()
        if (
            (jsxPath || '').trim() === '' ||
            jsxPath.startsWith('.') ||
            jsxPath.startsWith('/') ||
            jsxPath.indexOf('..') !== -1 ||
            jsxPath.indexOf('/./') !== -1 ||
            jsxPath.indexOf('//') !== -1 ||
            jsxPath.indexOf('\\.\\') !== -1 ||
            jsxPath.indexOf('\\\\') !== -1 ||
            jsxPath.startsWith("\\")
        ) {
            throw Error(`React4xp.setJsxFileName: invalid jsxPath (${JSON.stringify(jsxPath)}). This is a NAME, not a relative path, so it can't be missing/empty, or contain '..', '//', '/./' or start with '.' or '/'.${this.component ? ` Component: ${JSON.stringify(this.component)}` : ''}`);
        }

        // TODO: Get this from entryExtensions instead of hardcoded
        // Strip away trailing file extensions
        jsxPath = (jsxPath.endsWith('.jsx') || jsxPath.endsWith('.es6')) ?
            jsxPath.slice(0, -4) :
            (jsxPath.endsWith('.js')) ?
                jsxPath.slice(0, -3) :
                jsxPath;

        while (jsxPath.startsWith('/')) {
            jsxPath = jsxPath.substring(1);
        }

        this.jsxPath = jsxPath;

        return this;
    }

    //--------------------------------------------------------------- Props

    /** Sets the react4xp component's top-level props.
     * @param props {object} Props to be stored in the component. Must be a string-serializeable object!
     * @returns The react4xp component itself, for builder-like pattern.
     */
    setProps(props) {
        if (!props || typeof props !== 'object') {
            throw Error("Top-level props must be a string-serializeable object.");
        }
        this.props = props;
        return this;
    }


    //////////////////////////////////////////////////////  RENDERING  //////////////////////////////////////////////////


    // -----------------------------  RENDERING the body and/or container  --------------------------------

    /** Generates or modifies an HTML body, with a target container whose ID matches this component's react4xpId.
     * @param body {string} Existing HTML body, for example rendered from thymeleaf.
     *     If it already has a matching-ID target container, body passes through unchanged (use this option and the
     *     setId method to control where in the body the react component should be inserted). If it doesn't have a
     *     matching container, a matching <div> will be inserted at the end of the body, inside the root element. If
     *     body is missing, a pure-target-container body is generated and returned.
     * @param content {string} HTML content that, if included, is inserted into the container with the matching Id.
     * @returns {string} adjusted or generated HTML body with rendered react component.
     */
    renderTargetContainer(body, content) {
        this.ensureAndLockId();

        // If no (or empty) body is supplied: generate a minimal container body with only a target container element.
        if (((body || '') + "").replace(/(^\s+)|(\s+$)/g, "") === "") {
            return buildContainer(this.react4xpId, content);
        }

        // If there is a body but it's missing a target container element:
        // Make a container and insert it right before the closing tag.
        if (!bodyHasContainer(body, this.react4xpId)) {
            return HTMLinserter.insertAtEndOfRoot(body, buildContainer(this.react4xpId, content));
        }

        if (content) {
            return HTMLinserter.insertInsideContainer(body, content, this.react4xpId);
        }

        return body;
    }

    // TODO: Check docs! Is 'doRenderSSR' an API-breaking name and signature change? Re-insert old name!
    /** Renders a purely static HTML markup of ONLY the react4xp entry (without a surrounding HTML markup or container).
     *  Can override props that have previously been added to this component.
     *
     *  Returns an object: { html?: string, error?: string }
     *      (The keys 'html' and 'error' are as returned from ServerSideRenderer.java - so beware if ever refactoring them!)
     *  ...where 'html' is a rendered HTML string if successful component rendering (undefined on error),
     *  and 'error' an error message string from the Nashorn engine if any error occurred (undefined if successful rendering).
     */
    doRenderSSR = overrideProps => {
        const result = __.toNativeObject(SSRreact4xp.render(
            this.jsxPath,
            JSON.stringify(overrideProps || this.props),
            JSON.stringify(getComponentChunkNames(this.jsxPath))
        ));

        if (result.error && !this.react4xpId) {
            this.react4xpId = "react4xp_error";
            this.uniqueId();
        }

        return result;
    };


    /** Server-side rendering: Renders a static HTML markup and inserts it into an ID-matching target container in an HTML body. This is the same as renderBody({body: body}). If a
     * matching-ID container (or a body) is missing, it will be generated.
     * @param body {string} Existing HTML body, for example rendered from thymeleaf.
     * @returns {string} adjusted or generated HTML body with rendered react component.
     */
    renderSSRIntoContainer(body) {
        const { html, error } = this.doRenderSSR();
        return error
            ? this.renderTargetContainer(body, buildErrorContainer("React4xp SSR error", error, null, this))
            : this.renderTargetContainer(body, html);
    }

    renderBody = params => {
        // TODO: Page templates might be preferrable as standalones - that is, not need to be inserted into a container, but be able to encompass an entire DOM with <html> as the outer returned element. This is tricky: on SSR, doRenderSSR can be used, but how to do that on client-side react.render (and possibly worse, .hydrate)? And how to separate between them? isPage is NOT enough, since a page template might be both standalone or inserted.
        // if (this.isPage) {
        //    return this.doRenderSSR();
        // }
        const {body, clientRender} = params || {};
        return clientRender
            ? this.renderTargetContainer(body)
            : this.renderSSRIntoContainer(body);
    };


    //--------------------------------  RENDERING page contributions for importing entry / dependency chunks  --------------

    /** Generates or modifies existing enonic XP pageContributions. Adds client-side dependency chunks (core React4xp frontend,
     * shared libs and components etc, as well as the entry component scripts.
     * Also returns/adds small scripts that trigger the component scripts. Prevents duplicate references to dependencies.
     *
     * @param params {object} Additional parameters controlling the react rendering. All of them are optional:
     *      - pageContributions {object} Pre-existing pageContributions object that will be added BEFORE the new pageContributions rendered here.
     *      - clientRender {boolean-y} If clientRender is truthy, renderPageContributions will assume that the react4xp entry is not being rendered
     *          server-side (by .renderBody), and only calls a 'render' command in the client. If omitted or falsy, server-side
     *          rendering is assumed, and a 'hydrate' command is called on the entry instead.
     *      - suppressJS {boolean-y} If truthy, will make sure that the render/hydrate trigger call AND all the JS sources are skipped.
     *      - error {boolean/string} INTERNAL USE: If true boolean, a generic error message is output to the client console error log through page contributions,
     *          and if a string, that message is output. Also, if truthy, the render/hydrate trigger call is suppressed,
     *          in order to keep the error placeholder element visible
     *      TODO: Add option for more graceful failure? Render if error is true, instead of suppressing the trigger and displaying the error placeholder?
     */
    renderPageContributions = params => {
        const {pageContributions, clientRender, suppressJS, __error} = params || {};
        const command = clientRender
            ? 'render'
            : 'hydrate';

        this.ensureAndLockBeforeRendering();

        // TODO: If hasRegions (and isPage?), flag it in props, possibly handle differently?
        const bodyEnd = (!suppressJS && !__error)
            ? [
                // Browser-runnable script reference for the react4xp entry. Adds the entry to the browser (available as e.g. React4xp.CLIENT.<jsxPath>), ready to be rendered or hydrated in the browser:
                `<script src="${getAssetRoot()}${this.jsxPath}.js"></script>`,

                // Calls 'render' or 'hydrate' on the entry (e.g. React4Xp.CLIENT.render( ... )), along with the target container ID, and props.
                // Signature: <command>(entry, id, props?, isPage, hasRegions)
                `
<script>${
                    LIBRARY_NAME}.CLIENT.${command}(${
                    LIBRARY_NAME}['${this.jsxPath}'],${
                    JSON.stringify(this.react4xpId)},${
                    this.props
                        ? JSON.stringify(this.props)
                        : 'null'
                }${
                    (this.isPage || this.hasRegions)
                        ? `,${this.isPage},${this.hasRegions}`
                        : ''
                });</script>`
            ]
            : [];

        if (__error) {
            let message = (typeof __error === 'string')
                ? __error
                : "React4xp error"
            message = (message + "\\n" +
                "Entry: jsxPath='" + this.jsxPath + "', ID='" + this.react4xpId + "'\\n\\n" +
                "For more details, display this page in XP preview mode or Content Studio, and/or see the server log.")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "'")
            bodyEnd.push(
                `<script>console.error("${message}");</script>`
            );
        }


    																													log.info(prettify(bodyEnd, "index.renderPageContributions - bodyEnd"));
        const output = getAndMergePageContributions(this.jsxPath, pageContributions, { bodyEnd }, suppressJS);

    																													log.info(prettify(output, "index.renderPageContributions - output"));
    	return output;
    };


    ///////////////////////////////////////////////// STATIC ALL-IN-ONE RENDERER

    /** Main renderer. Default behavior: renders server-side and adds hydration logic for the client-side.
     *     However, renders a static, unhydrated server-side HTML string if request is missing or in edit mode.
     *     Or can render a container element with client-side rendering logic.
     *     On problems/errors, logs and falls back to a placeholder output which marks the problem on the page.
     *
     * @param entry {string|object} Reference to the React4xp entry JSX file. Corresponds to "view" parameter in the
     *      thymeleaf renderer etc. Can be a string or an object: If it's a string, it's interpreted as a jsxPath. If it's an
     *      object, it's interpreted as a component object from portal.getComponent(), and will be used to both find the JSX
     *      file (same name in same folder) and generate a unique ID (see also the params below). Note: current versions of
     *      XP (6.x, 7.0, 7.1 and probably 7.2 too) are not able to fetch a usable component object from a page controller.
     *      In this case, component will simply be null. There is a workaround in place for this (detecting page controller
     *      and using content.page instead), so it's currently possible to juse pass  null/undefined as the first argument
     *      from a page controller, and it will still work. However, this seems to be a bug in XP, so the bug might get fixed
     *      later and the workaround possibly removed To ensure future compatibility, you're recommended to to call
     *      getComponent() in the page controller and pass that to render, all the same.
     * @param props {object} Optional object. Sends props to the JSX file. Corresponds to "model" parameter in the
     *      thymeleaf renderer etc.
     * @param request {object} XP request object (from controller get-method etc). Mandatory for proper react rendering,
     *          but strictly speaking optional:
     *     - If omitted, the rendering will fall back to a template-like JSX rendering: outputs a static HTML string using the props,
     *          and it will not be activated/hydrated in the client. If only the static output is of interest, doing this may
     *          increase performance, since page contributions aren't rendered.
     * @param options {object} Additional parameters controlling the react rendering. All of them are optional:
     *     - clientRender {boolean} Controls server-side vs client-side rendering (as long as a request argument is given, see above).
     *         Server-side rendering (SSR) is the default behavior if this parameter is missing or falsy: a static HTML string is rendered as output, and react hydrate() pageContributions are added.
     *         If set to true, however, client-side rendering is forced: only a target container with an element ID is rendered in the output, but react render() pageContributions are added.
     *     - id {string} sets the target container element ID.
     *         (by force - if an ID was generated from a component-type entry object (see above), this manual ID will override the generated one).
     *         If the ID matches an DOM element ID in an input body (see body below), the rendered react component will be inserted in that element. If not, a container with this ID will be added.
     *         If there's no body parameter at all, an HTML string with a matching-ID element is generated.
     *         If the id parameter is omitted, a generic unique ID is generated as if uniqueId below is set to true.
     *     - uniqueId {boolean|string} If set, takes an extra step to ensure a unique ID:
     *         If id is already set (by previous param or using a component-object entry), a random integer will be postfixed to it.
     *         If uniqueId is a string, this is the prefix before the random postfix. If the id param is used in addition to a uniqueId string, uniqueId takes presedence and overrides id.
     *     - body {string} HTML string, for example a static string, or previously rendered from other react4xp output, thymeleaf or other templating engines.
     *         If it already has a matching-ID target container, body passes through unchanged (use this option and the setId method to control where in the body the react component should be inserted).
     *         If it doesn't have a matching container, a matching <div> will be inserted at the end of the body, inside the root element.
     *         If body is missing, a pure-target-container body is generated and returned.
     *     - pageContributions {object} Pre-existing pageContributions.
     *         If added, page contributions generated during this rendering will be added to (merged with) the input parameter ones.
     *
     * @returns a response object that can be directly returned from an XP controller, with body and pageContributions attributes
     */
    static render = (entry, props = {}, request = null, options = {}) => {
                                                                                                                        log.info(prettify({entry, props, request, options}, "React4xp.render params"));
        let react4xp = null;
        try {
            options.entry = entry;
            if (props && typeof props === 'object' && !Array.isArray(props)) {
                options.props = props;
            } else if (props) {
                throw Error("React4xp props must be falsy or a regular JS object, not this: " + JSON.stringify(props));
            }

            react4xp = React4xp._buildFromParams(options);

            const {body, pageContributions, clientRender} = options || {};

            let renderedBody, renderedPageContributions;

            // Content studio or request-less context: always SSR without trigger call or JS sources
            if (!request || request.mode === "edit" || request.mode === "inline") {
                                                                                                                        log.info("// Content studio or request-less context: always SSR without trigger call or JS sources");
                let { html, error } = react4xp.doRenderSSR();
                html = !error
                    ? html
                    : buildErrorContainer("React4xp SSR error", error, request, react4xp);

                renderedBody = react4xp.renderTargetContainer(body, html);
                renderedPageContributions = react4xp.renderPageContributions({
                    pageContributions,
                    clientRender: false,
                    suppressJS: true,
                });  // TODO: page contributions can be problematic inside CS? Inline the renderPageContributions output into body, here?


            // Live XP view, with SSR:
            } else if (!clientRender) {
                                                                                                                        log.info("// Live XP view, with SSR:");
                let { html, error } = react4xp.doRenderSSR();
                html = !error
                    ? html
                    : buildErrorContainer("React4xp SSR error", error, request, react4xp)

                renderedBody = react4xp.renderTargetContainer(body, html);
                renderedPageContributions = react4xp.renderPageContributions({
                    pageContributions,
                    clientRender: false,
                    __error: (request.mode === 'preview')
                        ? error
                        : (!!error) // In live mode, the actual error message is suppressed in favor of a generic one, by just setting it truthy here
                });


            // Live XP view, no SSR, all client-side rendered:
            } else {
                                                                                                                        log.info("// Live XP view, no SSR, all client-side rendered:");
                renderedBody = react4xp.renderTargetContainer(body),
                renderedPageContributions = react4xp.renderPageContributions({
                    pageContributions,
                    clientRender
                });
            }

            const output = {
                body: renderedBody,
                pageContributions: renderedPageContributions
            }
                                                                                                                        log.info(prettify(output, "React4xp.render output"));
            return output;

        } catch (e) {
            log.error(e);
            log.error("entry (" + typeof entry + "): " + JSON.stringify(entry));
            log.error("props (" + typeof props + "): " + JSON.stringify(props));
            log.error("request (" + typeof request + "): " + JSON.stringify(request));
            log.error("params (" + typeof options + "): " + JSON.stringify(options));
            const errObj = react4xp || {
                react4xpId: (options || {}).react4xpId,
                jsxPath: entry
            };

            																											log.info(prettify(errObj, "react4xp err info"));

            return {
                body: buildErrorContainer(
                    "React4xp error during rendering",
                    e.message,
                    request,
                    errObj
                )
            };
        }
    };

    static _clearCache = () => {
        templateDescriptorCache.clear();
    }
}

module.exports = React4xp;
