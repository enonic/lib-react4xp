import commonjs from '@rollup/plugin-commonjs';
//import { nodeResolve } from '@rollup/plugin-node-resolve';
//import polyfill from 'rollup-plugin-polyfill';
import typescript from '@rollup/plugin-typescript';


var outDir = 'build/resources/main/lib/enonic/react4xp';


export default {
	//external: [],
	input: 'src/main/resources/lib/enonic/react4xp/nashornPolyfills.ts',
	output: {
		dir: outDir,

		//format: 'cjs', // Doesn't convert const to var :(
		format: 'es', // Doesn't convert const to var, but that's expected

		preserveModules: false, // We want to bundle everything into one bundle, so this should be false!
		preserveModulesRoot: outDir,
	},
	plugins: [
		//nodeResolve(),
		typescript({
			compilerOptions: {
				outDir,
				//module: 'es6',
				target: 'es3'
			}
		}),
		commonjs()/*,
		polyfill([
			//'@mrhenry/core-web' // Expected an operand but found const
			//'es6-set-and-map', // This does not work! Gives: ReferenceError: "Map" is not defined
			//'es6-symbol/implement' // If you want to make sure your environment implements Symbol globally
			//'es6-symbol' // If you'd like to use native version when it exists and fallback to ponyfill if it doesn't
			//'es6-symbol/polyfill' // If you strictly want to use polyfill even if native Symbol exists (hard to find a good reason for that)
		]),*/
	]
};
