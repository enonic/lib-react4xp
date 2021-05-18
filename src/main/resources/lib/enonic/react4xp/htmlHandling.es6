const HTMLinserter = __.newBean('com.enonic.lib.react4xp.HtmlInserter');

module.exports = {
    buildContainer: (react4xpId, content) => `<div id="${react4xpId}">${content || ''}</div>`,

    buildErrorContainer: (heading, message, request, react4xpObj) => {
        const {jsxPath, react4xpId} = react4xpObj;
        if (message) log.error(message);

        let msg = (
            (!request || request.mode === 'live')
                ? ""
                : (message || "")
        );

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
        <div class="react4xp-error" style="background-color:#FFB6C1; margin-bottom:15px">
            <style>
                li,h2,p,a,strong,span { font-family:monospace; }
                h2 { font-size:17px }
                li,p,a,strong,span { font-size:12px }
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
    },

    makeErrorMessage: (attribute, component) => `Couldn't construct React4xp data: missing or invalid ${attribute}. ${
        this.isPage
            ? "Trying to handle a page controller template without a jsxPath string 'entry' parameter in the constructor - but that's usually okay. However, an in-construtor call to portal.getContent() returned data without a content.page." + attribute + " attribute, so no jsxPath can be derived. Content"
            : "No jsxPath string 'entry' parameter was given to the React4xp constructor - but that's usually okay. However, component data (either from the 'entry' parameter or from an in-constructor portal.getComponent() call) is missing a component." + attribute + " attribute, so no jsxPath can be derived. Component"
        } data: ${JSON.stringify(component)}`,

    insertAtEndOfRoot: (body, payload) => HTMLinserter.insertAtEndOfRoot(body, payload),
    insertInsideContainer: (body, payload, id, appendErrorContainer) => HTMLinserter.insertInsideContainer(body, payload, id, appendErrorContainer),
};
