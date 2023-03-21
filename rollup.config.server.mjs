import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';


const DIR_OUT_REL = 'build/resources/main';


export default {
	input: {
		'lib/enonic/react4xp/index': 'src/main/resources/lib/enonic/react4xp/index.ts',
		'services/react4xp/react4xp': 'src/main/resources/services/react4xp/react4xp.ts',
		'services/react4xp-dependencies/react4xp-dependencies': 'src/main/resources/services/react4xp-dependencies/react4xp-dependencies.ts'
	},
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
	],
	output: {
		chunkFileNames: 'lib/enonic/react4xp/_chunks/[name].js',

		dir: DIR_OUT_REL,

		// [!] Error: "default" was specified for "output.exports", but entry module "src/main/resources/services/react4xp-dependencies/react4xp-dependencies.ts" has the following exports: get
		//exports: 'default',

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

		//The following entry modules are using named and default exports together:
		//node_modules/@enonic/js-utils/dist/cjs/array/forceArray.js
		//node_modules/@enonic/js-utils/dist/cjs/array/includes.js
		//node_modules/@enonic/js-utils/dist/cjs/string/cleanAnyDoubleQuoteWrap.js
		//...and 5 other entry modules
		//Consumers of your bundle will have to use chunk['default'] to access their default export, which may not be what you want. Use `output.exports: 'named'` to disable this warning
		//exports: 'named',

		format: 'cjs',
		freeze: false,

		// https://rollupjs.org/guide/en/#outputinterop
		interop: 'auto',

		sourcemap: false
	},
	plugins: [
		alias({
			entries: [
				{ find: /^@enonic\/js-utils\/(.*)/, replacement: './node_modules/@enonic/js-utils/dist/esm/$1.mjs' },
				{ find: /^@enonic\/react4xp$/, replacement: './node_modules/@enonic/react4xp/dist/index.js' }, // Instead of node resolver
			]
		}),
		typescript({
			compilerOptions: {
				outDir: DIR_OUT_REL,
				target: 'es5'
			},
			tsconfig: 'tsconfig.json'
		}),
		commonjs(),
	]
};
