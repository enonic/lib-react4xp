import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
//import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';


const DIR_IN_REL = 'src/main/resources';
const DIR_OUT_REL = 'build/resources/main';


export default {
	external: [
		'/lib/cache',
		'/lib/enonic/static',
		'/lib/openxp/file-system',
		'/lib/xp/auth',
		'/lib/xp/content',
		'/lib/xp/context',
		'/lib/xp/common',
		'/lib/xp/io',
		'/lib/xp/mail',
		'/lib/xp/node',
		'/lib/xp/portal',
		'/lib/xp/repo',
		'/lib/xp/task',
		'/lib/xp/value',
		'/lib/xp/vhost',
		'prop-types',
		'react',
		'react-dom'
	],
	output: {
		chunkFileNames: '[name].js',

		dir: DIR_OUT_REL,

		// (!) Entry module "node_modules/@enonic/js-utils/dist/cjs/index.js"
		// is implicitly using "default" export mode, which means for CommonJS
		// output that its default export is assigned to "module.exports".
		// For many tools, such CommonJS output will not be interchangeable with
		// the original ES module.
		// If this is intended, explicitly set "output.exports" to either "auto"
		// or "default", otherwise you might want to consider changing the
		// signature of "node_modules/@enonic/js-utils/dist/cjs/index.js"
		// to use named exports only.
		exports: 'auto',

		format: 'cjs',
		freeze: false,

		globals: {
			'prop-types': 'PropTypes',
			'react': 'React',
			'react-dom': 'ReactDOM'
		},

		interop: false,
		//makeAbsoluteExternalsRelative: false, // Only works on CLI!
		preserveModules: true, // Copy modules into build/resources/main/node_modules instead of bundling them
		preserveModulesRoot: DIR_IN_REL,
		sourcemap: false
	},
	plugins: [
		alias({
			entries: [
				{ find: '@enonic/react4xp', replacement: 'node_modules/@enonic/react4xp/dist' }//,
				//{ find: '/lib/xp/io', replacement: '/lib/xp/io' } // [!] Error: Could not load /lib/xp/io (imported by src/main/resources/lib/enonic/react4xp/dependencies.ts): ENOENT: no such file or directory, open '/lib/xp/io'
			]
		}),
		//nodeResolve(),
		typescript(),
		commonjs(),
	]
};
