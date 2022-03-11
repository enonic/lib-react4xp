import type {
	React4xp,
	Request
} from '../../../index.d';
//import type {React4xp} from './React4xp';


export function buildContainer(
	react4xpId :string,
	content :string = ''
) {
	return `<div id="${react4xpId}">${content}</div>`;
}


export function buildErrorContainer(
	heading :string,
	message :string,
	request :Request,
	react4xpObj :React4xp.Class | {
		jsxPath :string|object
		react4xpId :React4xp.Id
	},
	hasOuterBorder :boolean = false
) {
    const {jsxPath, react4xpId} = react4xpObj || {};
    /*if (message) {
        log.error(message);
    }*/

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

    let protip = "For more details, see the server log.";
    if (request) {
        protip = (request.mode === 'live')
            ? "For more details, see the server log or preview this page in Content Studio."
            : 'For more details, see the server log.\\n\\nPROTIPS: Some ways to make errors in compiled entries/assets easier to pinpoint:\\n' +
                '- Rebuild your assets with react4xp development build mode, to make them more readable. Use react4xp.properties, or add this gradle CLI argument: -Pdev\\n' +
                '- Clientside-render the entry (https://developer.enonic.com/docs/react4xp/master/hello-react#client_side_rendering) and view it outside of content studio (live or preview mode), then inspect the browser console.\\n' +
                '- If the entry renders fine in clientside render mode and/or is visualized when hydrating despite a failing SSR, this is usually a sign that the entry (or something it imports) is trying to invoke purely-browser functionality (e.g. document- or window-functions etc), which is not available in SSR. ' +
                'Simple workaround: in those areas, check for typeof navigator === undefined or similar, to only use browser-specific functionality in the browser.';
    }

    return `
    <div class="react4xp-error" style="${hasOuterBorder ? '' : "1px solid #8B0000; padding:15px; "}background-color:#FFB6C1; margin-bottom:15px">
        <style>
            li,h2,p,a,strong,span { font-family:monospace; }
            h2 { font-size:17px }
            li,p,a,strong,span { font-size:12px }
            a,span.data { color:#8B0000; }
        </style>
        <h2 class="react4xp-error-heading">${heading}</h2>
        ${msg
            ? `<p class="react4xp-error-message">${msg}</p>`
            : ''
        }
        ${react4xpObj
            ? '<p class="react4xp-error-entry">' +
                    `<span class="jsxpath">Entry jsxPath: <span class="data">${jsxPath}</span></span><br/>` +
                    `<span class="id" >ID: <span class="data">${react4xpId}</span></span>` +
              '</p>'
            : ''
        }
        <script>console.error("${heading}${msg ? `:\\n${msg}` : ''}${
            react4xpObj
                ? '\\n\\nJsxPath: ' + jsxPath + "\\nID: " + react4xpId
                : ''
        }\\n\\n${protip}");</script>
    </div>
`;
}


export function makeErrorMessage(attribute :string, component) {
	return `Couldn't construct React4xp data: missing or invalid ${attribute}. ${
		this.isPage
		? "Trying to handle a page controller template without a jsxPath string 'entry' parameter in the constructor - but that's usually okay. However, an in-construtor call to portal.getContent() returned data without a content.page." + attribute + " attribute, so no jsxPath can be derived. Content"
		: "No jsxPath string 'entry' parameter was given to the React4xp constructor - but that's usually okay. However, component data (either from the 'entry' parameter or from an in-constructor portal.getComponent() call) is missing a component." + attribute + " attribute, so no jsxPath can be derived. Component"
	} data: ${JSON.stringify(component)}`
}
