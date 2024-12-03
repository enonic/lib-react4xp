// import manifestPlugin from 'esbuild-plugin-manifest';
// import {print} from 'q-i';
import { defineConfig } from 'tsup';

// const minify = false;

export default defineConfig((options) => {
	// print(options, { maxItems: Infinity });
	if (options.d === 'build/resources/main') {
		return {
			bundle: true,
			entry: {
				'lib/enonic/react4xp/index': 'src/main/resources/lib/enonic/react4xp/index.ts',
				'services/react4xp/react4xp': 'src/main/resources/services/react4xp/react4xp.ts',
				'services/react4xp-dependencies/react4xp-dependencies': 'src/main/resources/services/react4xp-dependencies/react4xp-dependencies.ts'
			},
			esbuildOptions(options, context) {
				// If you have libs with chunks, use this to avoid collisions
				options.chunkNames = '_lib_r4x_chunks/[name]-[hash]';
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
				'/lib/xp/schema',
				'/lib/xp/task',
				'/lib/xp/value',
				'/lib/xp/vhost',
			],
			format: [
				'cjs',
			],
			minify: false, // Minifying XP server files makes it harder to debug
			noExternal: [
				/^@enonic\/js-utils/
			],
			outDir: 'build/resources/main',
			platform: 'node',
			shims: true,
			sourcemap: false,
			splitting: true,
			// You can use --target es5 to compile the code down to es5, in this
			// target your code will be transpiled by esbuild to es2020 first,
			// and then transpiled to es5 by SWC.
			target: 'es5', // This works
			// target: 'ES5', // This doesn't??? // Transforming destructuring to the configured target environment ("es5") is not supported yet
			tsconfig: 'tsconfig.nashorn.json'
		};
	} // server
	// if (options?.entry?.['client']) {
	// 	return {
	// 		entry: 'src/main/resources/assets/react4xp/client.ts',
	// 		esbuildOptions(options, context) {
	// 			options.external = [
	// 				//'prop-types',
	// 				'react',
	// 				'react-dom'
	// 			];
	// 			// options.globals // Doesn't exist :(
	// 		},
	// 		esbuildPlugins: [
	// 			manifestPlugin({
	// 				extensionless: 'input',
	// 				filename: 'client.manifest.json',
	// 				generate: (entries) => {
	// 					return {
	// 						'client.js': entries['client']
	// 					};
	// 				},
	// 				shortNames: true
	// 			})
	// 		],
	// 		// For some reason this doesn't work here, but it does under esbuildOptions
	// 		// external: [
	// 		// 	//'prop-types',
	// 		// 	'react',
	// 		// 	'react-dom'
	// 		// ],
	// 		format: [
	// 			// 'cjs',
	// 			// 'esm',
	// 			'iife' // tsup has no umd
	// 		],
	// 		minify,
	// 		outDir: 'build/resources/main/assets/react4xp',
	// 		platform: 'browser',
	// 		sourcemap: minify,
	// 		splitting: false,
	// 		tsconfig: 'src/main/resources/assets/tsconfig.json'
	// 	}
	// } // client
	// if (options?.entry?.['executor']) {
	// 	return {
	// 		entry: 'src/main/resources/assets/react4xp/executor.ts',
	// 		esbuildOptions(options, context) {
	// 			// print(options, { maxItems: Infinity });
	// 			// print(context, { maxItems: Infinity });
	// 			// options.entryNames = '[dir]/[name]-[hash]';
	// 			// options.entryNames = '[name]-[hash]'; // Seems like name contains dir? So enable shortNames
	// 		},
	// 		esbuildPlugins: [
	// 			manifestPlugin({
	// 				extensionless: 'input',
	// 				filename: 'executor.manifest.json',
	// 				// A custom Function to create the manifest.
	// 				// The passed function should match the signature of
	// 				// (entries: {[key: string]: string}) => Object;
	// 				// and can return anything as long as it's serialisable by
	// 				// JSON.stringify.
	// 				generate: (entries) => {
	// 					// print(entries, { maxItems: Infinity });
	// 					return {
	// 						'executor.js': entries['executor']
	// 					};
	// 				},
	// 				// By default we assume that you want to hash the output
	// 				// files. We use [dir]/[name]-[hash] as the default hash
	// 				// format. You can disable hashing by setting this to false
	// 				// or you can set your own hash format by directly using
	// 				// esbuild's entryNames option.
	// 				// hash: false,
	// 				shortNames: true
	// 			})
	// 		],
	// 		external: [
	// 			//'prop-types',
	// 			'react',
	// 			'react-dom'
	// 		],
	// 		format: [
	// 			// 'cjs',
	// 			// 'esm',
	// 			'iife' // tsup has no umd
	// 		],
	// 		minify,
	// 		outDir: 'build/resources/main/assets/react4xp',
	// 		platform: 'browser',
	// 		sourcemap: minify,

	// 		// Code splitting currently only works with the esm output format,
	// 		// and it's enabled by default. If you want code splitting for cjs
	// 		// output format as well, try using --splitting flag which is an
	// 		// experimental feature to get rid of the limitation in esbuild.
	// 		splitting: false,

	// 		// target: 'es5',
	// 		tsconfig: 'src/main/resources/assets/tsconfig.json'
	// 	}
	// } // executor
});
