// import {print} from 'q-i';
import { defineConfig } from 'tsup';


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
});
