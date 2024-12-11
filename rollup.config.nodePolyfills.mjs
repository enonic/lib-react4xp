import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import esbuild from 'rollup-plugin-esbuild'
import { fileURLToPath } from 'url';
import {
	dirname,
	join
} from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Rollup config for nodePolyfills ' + __dirname);
const outDir = 'build/resources/main/lib/enonic/polyfill-react4xp';

export default {
	input: 'src/main/resources/lib/enonic/polyfill-react4xp/nodePolyfills.ts',
	output: {
		dir: outDir,
		format: 'cjs',
		preserveModules: false, // We want to bundle everything into one bundle, so this should be false!
	},
	// Some hooks are run in parallel but others, like the transform hook notably, are run in sequence, and the hooks are passed the result of the previous one.
	plugins: [
		alias({
			entries: [
				{ find: '@sinonjs/text-encoding', replacement: join(__dirname,'./node_modules/@sinonjs/text-encoding/lib/encoding.js') },
			]
		}),
		commonjs(), // A Rollup plugin to convert CommonJS modules to ES6, so they can be included in a Rollup bundle
		esbuild({
			minify: process.env.NODE_ENV === 'production',
			tsconfig: 'tsconfig.graal.json',
		}),
	]
};
