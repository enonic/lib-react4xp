// GraalJS doesn't provide a `process` global. Many libraries reach for `process.env.NODE_ENV`
// at module-load time, so a minimal shim avoids ReferenceError.
if (typeof process === 'undefined') { var process = { env: {} }; }

// GraalJS has no `console`. Map the common methods to its built-in `print`.
if (typeof console === 'undefined') {
    var console = { debug: print, log: print, warn: print, error: print };
}
