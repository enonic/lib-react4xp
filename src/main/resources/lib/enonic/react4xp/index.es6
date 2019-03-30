const { insertAppName } = require('./utils');

const { getAndMergePageContributions } = require('./pageContributions');

const HTMLinserter = __.newBean('com.enonic.lib.react4xp.HtmlInserter');
const SSRreact4xp = __.newBean('com.enonic.lib.react4xp.ssr.ServerSideRenderer');

// react4xp_constants.json is not part of lib-react4xp-runtime:
// it's an external shared-constants file expected to exist in the build directory of this index.es6.
// Easiest: the NPM package react4xp-buildconstants creates this file and copies it here.
const {
    LIBRARY_NAME, R4X_TARGETSUBDIR,
    NASHORNPOLYFILLS_FILENAME, EXTERNALS_CHUNKS_FILENAME, COMPONENT_STATS_FILENAME, ENTRIES_FILENAME, SERVICE_ROOT_URL
} = require('./react4xp_constants.json');;

const ASSET_ROOT = `${insertAppName(SERVICE_ROOT_URL)}react4xp/`;

/*
log.info("Constants: " + JSON.stringify({
    LIBRARY_NAME, R4X_TARGETSUBDIR,
    NASHORNPOLYFILLS_FILENAME, EXTERNALS_CHUNKS_FILENAME, COMPONENT_STATS_FILENAME, ENTRIES_FILENAME, ASSET_ROOT
}, null, 2));


log.info("SSRreact4xp.setConfig: " + JSON.stringify({
    "/${R4X_TARGETSUBDIR}": `/${R4X_TARGETSUBDIR}`,
    LIBRARY_NAME,
    "/${R4X_TARGETSUBDIR}/": `/${R4X_TARGETSUBDIR}/`,
    "${NASHORNPOLYFILLS_FILENAME}.js": `${NASHORNPOLYFILLS_FILENAME}.js`,
    ENTRIES_FILENAME,
    EXTERNALS_CHUNKS_FILENAME,
    COMPONENT_STATS_FILENAME
}, null, 2));
*/

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




    /** Optional initializer: returns a React4xp component instance initialized from a single set of parameters instead of
     *  the class approach.
     *  @param params {object} must include EITHER jsxPath or component! All other parameters are optional:
     *      - component {object} XP component object (used to extrapolate component part, sufficient if JSX entry file is in the same folder and has the same name).
     *      - jsxPath {string} path to react component entry, see available paths in build/main/resources/react4xp/entries.json
     *      - jsxFileName {string} for using a jsx entry in a XP component folder, but with a different file name than the XP component itself. No file extension.
     *      - props {object} react props sent in to the component
     *      - id {string} sets the target container element id. If this matches an ID in an input body, the react component will be rendered there. If not, a container with this ID will be added.
     *      - uniqueId {boolean|string} If set, ensures that the ID is unique. If id is set (previous param), a random integer will be postfixed to it. If uniqueId is a string, this is the prefix before the random postfix. If the id param is used in addition to a uniqueId string, uniqueId takes presedence and overrides id.
     */
    static buildFromParams = (params) => {
        const {jsxPath, component, jsxFileName, props, id, uniqueId} = params || {};

        if (jsxPath && component) {
            throw Error("Can't render React4xp for client: ambiguent parameters - use jsxPath or component, not both.");
        } else if (!jsxPath && !component) {
            throw Error("Can't render React4xp for client: need jsxPath or component (but not both)");
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

        if (jsxFileName) {
            react4xp.setJsxFileName(jsxFileName);
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

    /** When you've initialized the React4xp object with an XP component, but want to use a different JSX file than the
      * standard option (a JSX file in the same folder as the XP component, with the same name as the folder).
      *
      * @param jsxFileName (string, mandatory) Name of a JSX file. If it starts with "/" it will be interpreted as a full, absolute JSX path.
      *        If not, interpreted as a relative path, and the full path will be extrapolated relative to the XP
      *        component folder. jsxFileName MAY NOT START WITH "." !
      *
      * @returns The React4xp object itself, for builder-like telescoping pattern.
      */
    setJsxFileName(jsxFileName) {
        // Enforce a clean jsxPath - it's not just a file reference, but a react4xp component name!
        if (
            (jsxFileName || "").trim() === "" ||
            jsxFileName.startsWith('.') ||
            jsxFileName.indexOf('..') !== -1 ||
            jsxFileName.indexOf('/./') !== -1 ||
            jsxFileName.indexOf('//') !== -1)
        {
            throw Error(`React4xp.setJsxFileName: invalid jsxFileName (${JSON.stringify(jsxFileName)}). It can't be missing/empty, or contain '..', '//', '/./' or start with '.' since that messes things up! Use a clean, full, absolute jsxPath starting with '/' or a relative file reference inside the XP component folder.${this.component ? ` Component:\n${JSON.stringify(this.component)}`: ''}`);
        }

        // Strip away trailing file extensions
        jsxFileName = (jsxFileName.endsWith('.jsx') || jsxFileName.endsWith('.es6')) ?
            jsxFileName.slice(0, -4) :
            (jsxFileName.endsWith('.js')) ?
                jsxFileName.slice(0, -3) :
                jsxFileName;

        if (jsxFileName.startsWith('/')) {
            this.jsxPath = jsxFileName.substring(1);

        } else {
            if (!this.component) {
                throw Error(`React4xp.setJsxFileName: trying to set a relative jsxPath on a React4xp component that hasn't been initialized with an XP component. Use the constructor to set a component before calling this method, or set jsxPath directly in the constructor.`);
            }
            const compName = this.component.descriptor.split(":")[1];
            this.jsxPath = `site/${BASE_PATHS[this.component.type]}/${compName}/${jsxFileName}`;
        }

        return this;
    }




    //---------------------------------------------------------------

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








    //----------------------------------------------------------  RENDERING METHODS:

    /** Generates or modifies existing enonic XP pageContributions.js. Adds client-side dependency chunks (core React4xp frontend,
     * shared libs and components etc, as well as the entry component scripts.
     * Also returns/adds small scripts that trigger the component scripts. Prevents duplicate references to dependencies.
     *
     * @param pageContributions PageContributions object that the new scripts will be added to. If no input, new ones
     * are instantiated.
     */
    renderClientPageContributions = (pageContributions) => {
        this.ensureAndLockBeforeRendering();

        return getAndMergePageContributions(this.jsxPath, pageContributions, {
            bodyEnd: [
                // Browser-runnable script reference for the "naked" react component:
                `<script src="${ASSET_ROOT}${this.jsxPath}.js"></script>`,

                // That script will expose to the browser an element or function that can be handled by React4Xp.CLIENT.render. Trigger that, along with the target container ID, and props, if any:
                `<script defer>${LIBRARY_NAME}.CLIENT.render(${LIBRARY_NAME}['${this.jsxPath}'], ${JSON.stringify(this.react4xpId)} ${this.props ? ', ' + JSON.stringify(this.props) : ''});</script>`
            ]
        });
    };




    /** Generates or modifies existing enonic XP pageContributions.js. Adds client-side dependency chunks (core React4xp frontend,
      * shared libs and components etc, as well as the entry component scripts.
      * Also returns/adds small scripts that trigger the component scripts. Prevents duplicate references to dependencies.
      *
      * @param pageContributions PageContributions object that the new scripts will be added to. If no input, new ones
      * are instantiated.
      */
    renderHydrationPageContributions = (pageContributions) => {
        this.ensureAndLockBeforeRendering();

        return getAndMergePageContributions(this.jsxPath, pageContributions, {
            bodyEnd: [
                // Browser-runnable script reference for the "naked" react component:
                `<script src="${ASSET_ROOT}${this.jsxPath}.js"></script>`,

                // That script will expose to the browser an element or function that can be handled by React4Xp.CLIENT.render. Trigger that, along with the target container ID, and props, if any:
                `<script defer>${LIBRARY_NAME}.CLIENT.hydrate(${LIBRARY_NAME}['${this.jsxPath}'], ${JSON.stringify(this.react4xpId)} ${this.props ? ', ' + JSON.stringify(this.props) : ''});</script>`
            ]
        });
    };


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


    /** Renders a pure static HTML markup of the react component, without a surrounding HTML markup. Can override
      * props that have previously been added to this component. This presumably improves rendering performance,
      * although that hasn't been tested thoroughly.
      */
    renderComponentString = (overrideProps) => {
        return SSRreact4xp.renderToString(this.jsxPath, JSON.stringify(overrideProps || this.props));
    };


    /** SSR: Renders a static HTML markup and inserts it into an ID-matching target container in an HTML body. If a
     * matching-ID container (or a body) is missing, it will be generated.
     * @param body {string} Existing HTML body, for example rendered from thymeleaf.
     * @returns {string} adjusted or generated HTML body with rendered react component.
     */
    renderComponentIntoContainer(body) {
        const componentString = this.renderComponentString();
        return this.renderTargetContainer(body, componentString);
    }















    ///////////////////////////////////////////////// STATIC ALL-IN-ONE RENDERERS



    /** Safety renderer. More thorough fallback and failure reporting, and avoids server-side rendering - except in edit
     *  mode, where client-side rendering is the bigger hazard.
     *
     *  Returns a response object that can be directly returned from an XP controller.
     *  @param params {object} See .render for parameter details.
     *  @returns {object} Object with body and pageContributions.js. Body will contain a target container element for the react component. PageContributions will contain scripts referred by URL for running the component client-side and the component's dependencies, as well as an inline trigger script for starting the react frontend rendering into the target container. Duplicates in pageContributions.js will be removed, to avoid running identical scripts twice.
     */
    static renderSafe = (request, params) => {
        let react4xp;
        try {
            react4xp = React4xp.buildFromParams(params);
            const {body, pageContributions} = params || {};

            return (request.mode === 'edit') ?
                {
                    body: react4xp.renderComponentIntoContainer(body),
                    pageContributions
                } :
                {
                    body: react4xp.renderTargetContainer(body),
                    pageContributions: react4xp.renderClientPageContributions(pageContributions)
                };

        } catch (e) {
            log.error(e);
            log.error("Params: " + JSON.stringify(params, null, 2));
            return {
                body: buildErrorContainer((react4xp || {}).jsxPath, (react4xp || {}).react4xpId)
            }
        }
    };




    /** All-in-one best-practice renderer. Renders server-side if it can, adds hydration logic for the client-side.
      * On problems, falls back to renderSafe.
      * Returns a response object that can be directly returned from an XP controller.
      * @param request {object} XP request object.
      * @param params {object} must include EITHER jsxPath or component! All other parameters are optional:
      *      - component {object} XP component object (used to extrapolate component part, sufficient if JSX entry file is in the same folder and has the same name).
      *      - jsxPath {string} path to react component entry, see available paths in build/main/resources/react4xp/entries.json
      *      - jsxFileName {string} for using a jsx entry in a XP component folder, but with a different file name than the XP component itself. No file extension.
      *      - props {object} react props sent in to the component
      *      - id {string} sets the target container element id. If this matches an ID in an input body, the react component will be rendered there. If not, a container with this ID will be added.
      *      - uniqueId {boolean|string} If set, ensures that the ID is unique. If id is set (previous param), a random integer will be postfixed to it. If uniqueId is a string, this is the prefix before the random postfix. If the id param is used in addition to a uniqueId string, uniqueId takes presedence and overrides id.
      *      - body {string} Existing HTML body, for example rendered from thymeleaf. If it already has a matching-ID target container, body passes through unchanged (use this option and the setId method to control where in the body the react component should be inserted). If it doesn't have a matching container, a matching <div> will be inserted at the end of the body, inside the root element. If body is missing, a pure-target-container body is generated and returned.
      *      - pageContributions.js {object} Pre-existing pageContributions.js.
      * Renders dynamic/client-side react in XP preview and live mode, and static/server-side in edit mode (XP content studio). See .renderClient and .renderSSR for parameter and return details.
      */
    static render = (request, params) => {
        try {
            const react4xp = React4xp.buildFromParams(params);
            const {body, pageContributions} = params || {};
            return {
                body: react4xp.renderComponentIntoContainer(body),
                pageContributions: (request.mode === "edit") ?
                    pageContributions :
                    react4xp.renderHydrationPageContributions(pageContributions)
            };

        } catch (e) {
            return React4xp.renderSafe(request, params);
        }
    };
}
module.exports = React4xp;
