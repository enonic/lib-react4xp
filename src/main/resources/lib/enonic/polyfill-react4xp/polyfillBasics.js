if (typeof globalThis === 'undefined') { var globalThis = this; }
if (typeof window === 'undefined') { var window = this; }
if (typeof global === 'undefined') { var global = this; }
if (typeof exports === 'undefined') { var exports = {}; }
if (typeof process === 'undefined') { var process = {env:{}}; }
if (typeof console === 'undefined') { var console = {debug : print, log: print, warn: print, error: print}; }
if (typeof document === 'undefined') { var document = {}; }
if (typeof window.addEventListener !== 'function') { window.addEventListener = function () {}; }
