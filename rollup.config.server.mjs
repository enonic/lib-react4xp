import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
// import esbuild from 'rollup-plugin-esbuild'
// import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
// import ts from 'rollup-plugin-ts';
// import { swc } from 'rollup-plugin-swc3';

// NOTE: Sucrase doesn't tranform destructuring nor slurps...
// import sucrase from '@rollup/plugin-sucrase';

const DIR_IN_REL = 'src/main/resources';
const DIR_OUT_REL = 'build/resources/main';


export default {
    external: [
        // '/lib/enonic/react4xp/asset/handleAssetRequest',
        // /^\/lib\//,
        '/lib/cache',

        // '/lib/enonic/react4xp',
        // /^\/lib\/enonic\/react4xp/,

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
        chunkFileNames: '[name].js',

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

        preserveModules: true, // Copy modules into build/resources/main/node_modules instead of bundling them
        preserveModulesRoot: DIR_IN_REL,
        sourcemap: false
    },
    makeAbsoluteExternalsRelative: false,
    plugins: [
		alias({
			entries: [
				// { find: /^JS_UTILS_ALIAS\/(.*)/, replacement: './node_modules/@enonic/js-utils/src/$1.ts' },
				{ find: /^JS_UTILS_ALIAS\/(.*)/, replacement: './node_modules/@enonic/js-utils/dist/cjs/$1.js' },
			]
		}),
		// nodeResolve(),
        typescript({
            compilerOptions: {
                outDir: DIR_OUT_REL,
                target: 'es5'
            },
			tsconfig: 'tsconfig.json'
        }),

        // ts({
        //     external: [
        //         /^LIB_REACT4XP_ALIAS.*$/
        //         // /^\/lib\//,
        //         // '/lib/cache',

        //         // '/lib/enonic/react4xp',
        //         // '/lib/enonic/react4xp/asset/handleAssetRequest',
        //         // /^\/lib\/enonic\/react4xp/,

        //         // '/lib/enonic/static',
        //         // '/lib/openxp/file-system',
        //         // '/lib/xp/auth',
        //         // '/lib/xp/content',
        //         // '/lib/xp/context',
        //         // '/lib/xp/common',
        //         // '/lib/xp/io',
        //         // '/lib/xp/mail',
        //         // '/lib/xp/node',
        //         // '/lib/xp/portal',
        //         // '/lib/xp/repo',
        //         // '/lib/xp/task',
        //         // '/lib/xp/value',
        //         // '/lib/xp/vhost',
        //     ],
        //     transpiler: 'swc',
        //     tsconfig: {
        //         outDir: DIR_OUT_REL,
        //         target: 'es5'
        //     }
        // }),

        // ES6 destructuring is not yet implemented
        // ES6 function rest parameter declaration is not yet implemented
        // sucrase({
        //     enableLegacyBabel5ModuleInterop: true,
        //     enableLegacyTypeScriptModuleInterop: true,
        //     exclude: ['node_modules/**'],
        //     transforms: ['typescript']
        // }),

        // esbuild({
        //     // Transforming const to the configured target environment ("es5") is not supported yet
        //     // Transforming let to the configured target environment ("es5") is not supported yet
        //     // target: 'es5'
        // }),

        // swc({
        //     jsc: {
        //         target: "es5"
        //     },
        //     module: {
        //         type: 'commonjs'
        //     }
        // }),

        commonjs(),
    ]
};
