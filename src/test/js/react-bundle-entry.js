// Bundles real React 19 + react-dom/server.edge for the GraalJS integration test.
// react-dom/server.edge has no MessageChannel/setImmediate dependency (verified by grep) —
// it's the same path the React team recommends in https://github.com/facebook/react/issues/31827.
//
// This bundle assumes the production-compiled nodePolyfills.js has already been loaded into
// the GraalJS context — it provides the TextEncoder global that react-dom-server.edge looks up
// at module-load time, plus the SSR timer no-ops.

const React = require('react');
const ReactDOMServer = require('react-dom/server.edge');

globalThis.React = React;
globalThis.ReactDOMServer = { renderToString: ReactDOMServer.renderToString };
