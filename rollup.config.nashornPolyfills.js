import commonjs from '@rollup/plugin-commonjs';
//import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';


var outDir = 'build/resources/main/lib/enonic/react4xp';


export default {
	//external: [],
	input: 'src/main/resources/lib/enonic/react4xp/nashornPolyfills.ts',
	output: {
		dir: outDir,

		//format: 'cjs',
		format: 'es',

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
		commonjs(),
	]
};
