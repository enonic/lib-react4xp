// Bundles real React 19 + react-dom/server.browser for the GraalJS integration test.
// server.browser is what @enonic/react4xp's webpack config currently resolves to (default
// 'browser' condition); see https://github.com/facebook/react/issues/31827.
//
// At module-load time, server.browser does `new MessageChannel()` for its streaming
// scheduler. Without the MessageChannel polyfill in nodePolyfills.ts, this would throw
// ReferenceError before any render call. With the polyfill, the module loads and
// `renderToString` (which goes through server-legacy.browser and never touches the
// channel) works. Streaming APIs would silently hang — they're not exercised here.

const React = require('react');
const ReactDOMServer = require('react-dom/server.browser');

globalThis.React = React;
globalThis.ReactDOMServer = { renderToString: ReactDOMServer.renderToString };
