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
