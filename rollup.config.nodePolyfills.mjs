import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';

const outDir = 'build/resources/main/lib/enonic/polyfill-react4xp';

export default {
	input: 'src/main/resources/lib/enonic/polyfill-react4xp/nodePolyfills.ts',
	output: {
		dir: outDir,

		format: 'cjs',

		preserveModules: false, // We want to bundle everything into one bundle, so this should be false!
	},
	plugins: [
		alias({
			entries: [
				{ find: '@sinonjs/text-encoding', replacement: './node_modules/@sinonjs/text-encoding/index.js' },
			]
		}),
		typescript({
			compilerOptions: {
				outDir,
				target: 'es5'
			}
		}),
		commonjs()
	]
};
