if (typeof globalThis === 'undefined') { var globalThis = this; }
if (typeof window === 'undefined') { var window = this; }
if (typeof global === 'undefined') { var global = this; }
if (typeof exports === 'undefined') { var exports = {}; }
if (typeof process === 'undefined') { var process = {env:{}}; }
if (typeof console === 'undefined') { var console = {debug : print, log: print, warn: print, error: print}; }
if (typeof window.addEventListener !== 'function') { window.addEventListener = function () {}; }

// MessageChannel polyfill for React 19 compatibility
if (typeof MessageChannel === 'undefined') {
	globalThis.MessageChannel = function MessageChannel() {
		var channel = this;
		var queue1 = [];
		var queue2 = [];

		function MessagePort(queue, otherQueue) {
			this.onmessage = null;
			this.postMessage = function(data) {
				var port = this;
				otherQueue.push(data);
				// Schedule message delivery asynchronously
				setTimeout(function() {
					if (port.onmessage && otherQueue.length > 0) {
						var message = otherQueue.shift();
						port.onmessage({ data: message });
					}
				}, 0);
			};
		}

		this.port1 = new MessagePort(queue1, queue2);
		this.port2 = new MessagePort(queue2, queue1);
	};
}

// atob/btoa polyfill (GraalJS provides neither; entities v6+ base64-encoded
// HTML entity tables need atob to decode at module-load time).
if (typeof atob === 'undefined') {
    var __B64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    var __B64_LOOKUP = (function () {
        var lookup = new Array(256);
        for (var i = 0; i < 64; i++) {
            lookup[__B64_ALPHABET.charCodeAt(i)] = i;
        }
        return lookup;
    })();

    globalThis.atob = function (str) {
        str = String(str).replace(/=+$/, '');
        var len = str.length;
        if (len % 4 === 1) {
            throw new Error('InvalidCharacterError');
        }
        var output = '', bits = 0, value = 0;
        for (var i = 0; i < len; i++) {
            var c = __B64_LOOKUP[str.charCodeAt(i)];
            if (c === undefined) {
                throw new Error('InvalidCharacterError');
            }
            value = (value << 6) | c;
            bits += 6;
            if (bits >= 8) {
                bits -= 8;
                output += String.fromCharCode((value >> bits) & 0xff);
            }
        }
        return output;
    };

    globalThis.btoa = function (str) {
        var bytes = String(str), len = bytes.length, out = '';
        for (var i = 0; i < len; i += 3) {
            var b1 = bytes.charCodeAt(i);
            var b2 = i + 1 < len ? bytes.charCodeAt(i + 1) : 0;
            var b3 = i + 2 < len ? bytes.charCodeAt(i + 2) : 0;
            out += __B64_ALPHABET.charAt(b1 >> 2);
            out += __B64_ALPHABET.charAt(((b1 & 3) << 4) | (b2 >> 4));
            out += i + 1 < len ? __B64_ALPHABET.charAt(((b2 & 0xf) << 2) | (b3 >> 6)) : '=';
            out += i + 2 < len ? __B64_ALPHABET.charAt(b3 & 0x3f) : '=';
        }
        return out;
    };
}
