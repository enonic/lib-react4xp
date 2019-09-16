const { getAndMergePageContributions } = require('./pageContributions');
const { getAssetRoot } = require('./serviceRoots');

const HTMLinserter = __.newBean('com.enonic.lib.react4xp.HtmlInserter');
const SSRreact4xp = __.newBean('com.enonic.lib.react4xp.ssr.ServerSideRenderer');

// react4xp_constants.json is not part of lib-react4xp-runtime:
// it's an external shared-constants file expected to exist in the build directory of this index.es6.
// Easiest: the NPM package react4xp-buildconstants creates this file and copies it here.
const {
    LIBRARY_NAME, R4X_TARGETSUBDIR,
    NASHORNPOLYFILLS_FILENAME, EXTERNALS_CHUNKS_FILENAME, COMPONENT_STATS_FILENAME, ENTRIES_FILENAME
} = require('./react4xp_constants.json');;


SSRreact4xp.setConfig(
    `/${R4X_TARGETSUBDIR}`,
    LIBRARY_NAME,
    `/${R4X_TARGETSUBDIR}/`,
    `${NASHORNPOLYFILLS_FILENAME}.js`,
    ENTRIES_FILENAME,
    EXTERNALS_CHUNKS_FILENAME,
    COMPONENT_STATS_FILENAME);

const BASE_PATHS = {
    part: "parts",
    page: "pages",
    layout: "layouts",  // <-- experimental. Might not work.
};



const bodyHasContainer = (body, react4xpId) => {
    const react4xpPattern = new RegExp("<[^>]+\\s+id\\s*=\\s*[\"']" + react4xpId + "[\"']", 'i');
    //log.info(JSON.stringify({react4xpId: react4xpId, react4xpPattern}, null, 2));

    return !!body.match(react4xpPattern);
};



const buildContainer = (react4xpId, content) => `<div id="${react4xpId}">${content || ''}</div>`;


const buildErrorContainer = (jsxPath, react4xpId) => '\n' +
    '<div class="react4xp-error" style="border: 1px solid #8B0000; padding: 15px; background-color: #FFB6C1">\n' +
    "    <h2>React4xp component error</h2>\n" +
    '    <div class="react4xp-component-name">' +
    '       <p><strong>Component name / ID:</strong></p>\n' +
    '       <p>' + jsxPath + ' / ' + react4xpId + '</p>\n' +
    '    </div>\n' +
    '    <p class="react4xp-error-message">See the log for details.</p>\n' +
    '</div>\n';


//////////////////////////////////////////////////////////////////////

class React4xp {

    /** Mandatory constructor initParam, one of two options (overloaded function):
     * @param component {Object} If initParam is an object: the portal.getComponent() object of the Enonic
     *      XP component (currently page or part) that the react component belongs to. XP and react components are found
     *      in the same folder (and the component object is used to extrapolate the resource path - jsxPath).
     *
     * @param jsxPath {String} If initParam is a string: path to react component entry,
     *     relative to the folder where the transpiled (JS) react components are found. Overview of available entry
     *     paths is built to: build/resources/main/react4xp/entries.json.
     *     Relative to component root folder (currently) build/resources/main/react4xp/ , or in the JAR: react4xp/ .
     *     JsxPath can also be extrapolated from the source (untranspiled JSX) component this way:
     *         - Its path under src/main/react4xp/_components/
     *         - Or under src/main/resources/site (in which case jsxPath will start with "site/").
     *     JsxPath includes the file name without the file extension.
     */
    constructor(initParam) {
        this.props = null
        this.react4xpIdLocked = false;

        if (typeof initParam === "object") {
            if (!initParam || !initParam.descriptor || !initParam.type) {
                throw Error(`Can't initialize Reac4xp component with initParm = ${JSON.stringify(initParam)}. Doesn't seem to be a valid XP component object - missing type or descriptor?`);
            }
            this.component = initParam;
            const compName = this.component.descriptor.split(":")[1];
            this.jsxPath = `site/${BASE_PATHS[this.component.type]}/${compName}/${compName}`;
            this.react4xpId = `${BASE_PATHS[this.component.type]}_${compName}_${this.component.path}`.replace(/\//g, "_")

        } else if (typeof initParam === "string") {
            this.component = null;
            this.react4xpId = null;
            this.jsxPath = initParam.trim();
            if (this.jsxPath === "") {
                throw Error(`Can't initialize Reac4xp component with initParm = ${JSON.stringify(initParam)}. XP component object or jsxPath string only, please.`);
            }

        } else {
            throw Error(`Can't initialize Reac4xp component with initParm = ${JSON.stringify(initParam)}. XP component object or jsxPath string only, please.`);
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
        const {jsxPath, component, id, uniqueId, props} = params || {};

        if (!component && !jsxPath) {
            throw Error("Can't render React4xp for client: need 'jsxPath' or 'component' parameter");
        }

        const react4xp = new React4xp(component || jsxPath);

        if (props) {
            react4xp.setProps(props);
        }

        if (id) {
            react4xp.setId(id);
        }

        if (uniqueId) {
            if (typeof uniqueId === "string") {
                react4xp.setId(uniqueId);
            }
            react4xp.uniqueId();
        }

        if (jsxPath) {
            react4xp.setJsxPath(jsxPath);
        }

        return react4xp;
    };


    //---------------------------------------------------------------

    checkIdLock() {
        if (this.react4xpIdLocked) {
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
        this.react4xpIdLocked = true;
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



    /** Sets the react4xpId - the HTML ID of the target container this component will be rendered into.
      * Deletes the ID if argument is omitted.
      * @returns The react4xp component itself, for builder-like telescoping pattern.
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
      * @returns The react4xp component itself, for builder-like telescoping pattern.
      */
    uniqueId() {
        return this.setId((this.react4xpId || "") + "_" + Math.floor(Math.random() * 99999999));
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
      * @returns The React4xp object itself, for builder-like telescoping pattern.
      */
    setJsxPath(jsxPath) {
        // Enforce a clean jsxPath - it's not just a file reference, but a react4xp component name!
        if (
            (jsxPath || "").trim() === "" ||
            jsxPath.startsWith('.') ||
            jsxPath.startsWith('/') ||
            jsxPath.indexOf('..') !== -1 ||
            jsxPath.indexOf('/./') !== -1 ||
            jsxPath.indexOf('//') !== -1 ||
            jsxPath.indexOf('\\.\\') !== -1 ||
            jsxPath.indexOf('\\\\') !== -1 ||
            jsxPath.startsWith("\\")
        ) {
            throw Error(`React4xp.setJsxFileName: invalid jsxPath (${JSON.stringify(jsxPath)}). This is a NAME, not a relative path, so it can't be missing/empty, or contain '..', '//', '/./' or start with '.' or '/'.${this.component ? ` Component: ${JSON.stringify(this.component)}`: ''}`);
        }

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
      * @returns The react4xp component itself, for builder-like telescoping pattern.
      */
    setProps(props) {
        if (!props || typeof props !== 'object') {
            throw Error("Top-level props must be a string-serializeable object.");
        }
        this.props = props;
        if (this.react4xpId) {
            this.props.react4xpId = this.react4xpId;
        }
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


    /** Renders a pure static HTML markup of ONLY the react component, without a surrounding HTML markup or container.
      * Can override props that have previously been added to this component.
      */
    renderComponentString = (overrideProps) => SSRreact4xp.renderToString(this.jsxPath, JSON.stringify(overrideProps || this.props));


    /** Server-side rendering: Renders a static HTML markup and inserts it into an ID-matching target container in an HTML body. If a
     * matching-ID container (or a body) is missing, it will be generated.
     * @param body {string} Existing HTML body, for example rendered from thymeleaf.
     * @returns {string} adjusted or generated HTML body with rendered react component.
     */
    renderSSRIntoContainer(body) {
        const componentString = this.renderComponentString();
        return this.renderTargetContainer(body, componentString);
    }













    //--------------------------------  RENDERING page contributions for importing entry / dependency chunks  --------------

    /** Generates or modifies existing enonic XP pageContributions. Adds client-side dependency chunks (core React4xp frontend,
     * shared libs and components etc, as well as the entry component scripts.
     * Also returns/adds small scripts that trigger the component scripts. Prevents duplicate references to dependencies.
     *
     * @param params {object} Additional parameters controlling the react rendering. All of them are optional:
     *      - pageContributions PageContributions object that will be added before the new pageContributions.
     *      - clientRender If clientRender is truthy, this function will assume that the react4xp entry is not being rendered
     *          server-side (by .renderBody), and only calls a 'render' command in the client. If omitted or falsy, server-side
     *          rendering is assumed, and a 'hydrate' command is called on the entry instead.
     */
    renderPageContributions = params => {
        const {pageContributions, clientRender} = params || {};
        const command = clientRender ? 'render' : 'hydrate';

        this.ensureAndLockBeforeRendering();

        return getAndMergePageContributions(this.jsxPath, pageContributions, {
            bodyEnd: [
                // Browser-runnable script reference for the react4xp entry. Adds the entry to the browser (available as e.g. React4xp.CLIENT.<jsxPath>), ready to be rendered or hydrated in the browser:
                `<script src="${getAssetRoot()}${this.jsxPath}.js"></script>`,

                // Calls 'render' or 'hydrate' on the entry (e.g. React4Xp.CLIENT.render( ... )), along with the target container ID, and props:
                `<script defer>${LIBRARY_NAME}.CLIENT.${command}(${LIBRARY_NAME}['${this.jsxPath}'], ${JSON.stringify(this.react4xpId)} ${this.props ? ', ' + JSON.stringify(this.props) : ''});</script>`
            ]
        });
    };



    ///////////////////////////////////////////////// STATIC ALL-IN-ONE RENDERER

    /** Main renderer. Default behavior: renders server-side and adds hydration logic for the client-side.
      *     However, renders a static, unhydrated server-side HTML string if request is missing or in edit mode.
      *     Or can render a container element with client-side rendering logic.
      *     On problems/errors, logs and falls back to a placeholder output which marks the problem on the page.
      *
      * @param entry {string|object} Mandatory reference to the React4xp entry JSX file. Corresponds to "view" parameter in the thymeleaf renderer etc.
      *     Can be a string or an object:
      *     If it's a string, it's interpreted as a jsxPath.
      *     If it's an object, it's interpreted as a component object from portal.getComponent(), and will be used to both find the JSX file and generate a unique ID (see also the params below).
      * @param props {object} Optional object. Sends props to the JSX file. Corresponds to "model" parameter in the thymeleaf renderer etc.
      * @param request {object} XP request object (from controller get-method etc). Mandatory for proper react rendering, but strictly speacking optional:
      *     If omitted, the rendering will fall back to a template-like JSX rendering: outputs a static HTML string using the props,
      *     and it will not be activated/hydrated in the client.
      * @param params {object} Additional parameters controlling the react rendering. All of them are optional:
      *      - clientRender {boolean} Controls server-side vs client-side rendering (as long as a request argument is given, see above).
      *         Server-side rendering (SSR) is the default behavior if this parameter is missing or falsy: a static HTML string is rendered as output, and react hydrate() pageContributions are added.
      *         If set to true, however, client-side rendering is forced: only a target container with an element ID is rendered in the output, but react render() pageContributions are added.
      *      - id {string} sets the target container element ID.
      *         (by force - if an ID was generated from a component-type entry object (see above), this manual ID will override the generated one).
      *         If the ID matches an DOM element ID in an input body (see body below), the rendered react component will be inserted in that element. If not, a container with this ID will be added.
      *         If there's no body parameter at all, an HTML string with a matching-ID element is generated.
      *         If the id parameter is omitted, a generic unique ID is generated as if uniqueId below is set to true.
      *      - uniqueId {boolean|string} If set, takes an extra step to ensure a unique ID:
      *         If id is already set (by previous param or using a component-object entry), a random integer will be postfixed to it.
      *         If uniqueId is a string, this is the prefix before the random postfix. If the id param is used in addition to a uniqueId string, uniqueId takes presedence and overrides id.
      *      - body {string} HTML string, for example a static string, or previously rendered from other react4xp output, thymeleaf or other templating engines.
      *         If it already has a matching-ID target container, body passes through unchanged (use this option and the setId method to control where in the body the react component should be inserted).
      *         If it doesn't have a matching container, a matching <div> will be inserted at the end of the body, inside the root element.
      *         If body is missing, a pure-target-container body is generated and returned.
      *      - pageContributions {object} Pre-existing pageContributions.
      *         If added, page contributions generated during this rendering will be added to (merged with) the input parameter ones.
      *
      * @returns a response object that can be directly returned from an XP controller, with body and pageContributions attributes
      */
    static render = (entry, props = {}, request = null, params = {}) => {
        let react4xp;
        try {
            if (typeof entry === 'string') {
                params.jsxPath = entry;
            } else if (entry && typeof entry === 'object') {
                params.component = entry;
            }

            if (props && typeof props === 'object') {
                params.props = props;
            }

            react4xp = React4xp._buildFromParams(params);
            const {body, pageContributions} = params || {};

            if (!request || request.mode === "edit") {
                return {
                    body: react4xp.renderSSRIntoContainer(body),
                    pageContributions
                };

            } else if (!params.clientRender) {
                return {
                    body: react4xp.renderSSRIntoContainer(body),
                    pageContributions: react4xp.renderHydrationPageContributions(pageContributions)
                };

            } else {
                return {
                    body: react4xp.renderTargetContainer(body),
                    pageContributions: react4xp.renderClientPageContributions(pageContributions)
                };
            }

        } catch (e) {
            log.error(e);
            log.error("entry (" + typeof entry + "): " + JSON.stringify(params));
            log.error("props (" + typeof props + "): " + JSON.stringify(props));
            log.error("request (" + typeof request + "): " + JSON.stringify(request));
            log.error("params (" + typeof params + "): " + JSON.stringify(params));
            const r = react4xp || {};
            return {
                body: buildErrorContainer(r.jsxPath, r.react4xpId)
            }
        }
    };
}
module.exports = React4xp;
