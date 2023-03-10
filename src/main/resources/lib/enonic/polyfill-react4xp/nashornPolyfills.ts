// COMPILE AND RUN IN NASHORN

//──────────────────────────────────────────────────────────────────────────────
// core-js Only required features (global namespace pollution)
//──────────────────────────────────────────────────────────────────────────────
//import 'core-js/actual/map'; // Expected an operand but found import
//import * from 'core-js/actual/map'; // ReferenceError: "Map" is not defined
//import * from 'core-js/actual/set';

//──────────────────────────────────────────────────────────────────────────────
// core-js Without global namespace pollution
//──────────────────────────────────────────────────────────────────────────────
import Map from 'core-js-pure/actual/map';
import Set from 'core-js-pure/actual/set';
import Symbol from 'core-js-pure/actual/symbol';

//──────────────────────────────────────────────────────────────────────────────
// @mrhenry/core-web
//──────────────────────────────────────────────────────────────────────────────
//import '@mrhenry/core-web'; // Expected an operand but found import
//import '@mrhenry/core-web/lib'; // Expected an operand but found import
//import '@mrhenry/core-web/modules/TextEncoder'; // ReferenceError: "self" is not defined


//──────────────────────────────────────────────────────────────────────────────
// es6-set-and-map
//──────────────────────────────────────────────────────────────────────────────
/*import { // This works
	map as Map//,
	//set as Set
} from 'es6-set-and-map';*/
//import {map, set} from 'es6-set-and-map';
//import * as SetAndMap from 'es6-set-and-map';
//import SetAndMap from 'es6-set-and-map'; // Error: 'default' is not exported
//const setAndMap = SetAndMap();

//──────────────────────────────────────────────────────────────────────────────
// es6-symbol
//──────────────────────────────────────────────────────────────────────────────
//const Symbol = require('es6-symbol'); // Ponyfill // rollup doesn't bundle require?
//import Symbol from 'es6-symbol'; // Ponyfill // Doesn't appear in transpiled file
//require('es6-symbol/implement'); // rollup doesn't bundle require?

//import Symbol from 'es6-symbol/polyfill'; // Since I have a undefined check below: Import the Polyfill rather than the Ponyfill.


const context = (1, eval)('this'); // https://stackoverflow.com/questions/9107240/1-evalthis-vs-evalthis-in-javascript;


// Polyfills Set, Map and empty event listener (since nashorn is only used for SSR, where event listener is irrelevant):

//@ts-ignore TS2451: Cannot redeclare block-scoped variable
//const Map = require('es6-set-and-map').map;
//const Map = map;
//const Map = setAndMap.map;
//@ts-ignore TS2451: Cannot redeclare block-scoped variable
//const Set = require('es6-set-and-map').set;
//const Set = set;
//const Set = setAndMap.set;
(function (context) {
	if (typeof context.Map === 'undefined') context.Map = Map; // eslint-disable-line no-param-reassign
	if (typeof context.Set === 'undefined') context.Set = Set; // eslint-disable-line no-param-reassign
	if (typeof context.Symbol === 'undefined') context.Symbol = Symbol;
})(context);


type PhaserConstructor = ()=>void;
interface PhaserInstance {
	arriveAndDeregister :()=>void
	forceTermination :()=>void
	register :()=>void
}

type TimerConstructor = (name :string, isDaemon :boolean)=>void;
interface TimerInstance {
	cancel :()=>void
	schedule :(
		fn :()=>void,
		millis :number
	)=>void
}

// Object.assign
// Polyfill from: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign#polyfill
//@ts-expect-error TS2550: Property 'assign' does not exist on type 'ObjectConstructor'.
if (typeof Object.assign !== 'function') {
	Object.defineProperty(Object, "assign", {
		//@ts-expect-error TS6133: 'varArgs' is declared but its value is never read.
		value: function assign(target, varArgs) {
			'use strict';

			if (target === null || target === undefined) {
				throw new TypeError('Cannot convert undefined or null to object');
			}

			const to = Object(target);

			for (let index = 1; index < arguments.length; index++) {
				const nextSource = arguments[index];

				if (nextSource !== null && nextSource !== undefined) {
					for (let nextKey in nextSource) {
						// Avoid bugs when hasOwnProperty is shadowed
						if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
							to[nextKey] = nextSource[nextKey];
						}
					} // for source
				} // if
			} // for arguments
			return to;
		},
		writable: true,
		configurable: true
	});
}

/*if (!Array.prototype.flat) {
	Object.defineProperty(Array.prototype, 'flat', {
		value: function(depth = 1) {
			return this.reduce(function (flat :Array<unknown>, toFlatten :Array<unknown>) {
				return flat.concat((Array.isArray(toFlatten) && (depth>1)) ? toFlatten.flat(depth-1) : toFlatten);
			}, []);
		}
	});
}

Number.isInteger = Number.isInteger || function(value) {
	return typeof value === 'number' &&
	isFinite(value) &&
	Math.floor(value) === value;
};*/
