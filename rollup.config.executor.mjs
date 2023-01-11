// import commonjs from '@rollup/plugin-commonjs';
// import hash from 'rollup-plugin-hash';

// See https://github.com/shuizhongyueming/rollup-plugin-output-manifest/issues/21
import pluginManifest from 'rollup-plugin-output-manifest';
const { default: outputManifest } = pluginManifest;

import typescript from '@rollup/plugin-typescript';


var outDir = 'build/resources/main/assets/react4xp';

export default {
	external: [
		//'prop-types',
		'react',
		'react-dom'
	],
	input: 'src/main/resources/assets/react4xp/executor.ts',
	output: {
		dir: outDir,

		entryFileNames: '[name].[hash].js',

		//format: 'cjs',
		//format: 'es',
		//format: 'esm',
		//format: 'iife',
		format: 'umd',

		globals: {
			//'prop-types': 'PropTypes',
			'react': 'React',
			'react-dom': 'ReactDOM'
		},

		name: 'React4xp.EXECUTOR', // bundle name (required by at least umd) // But I'm not seeing it in the resulting file? But if it works, who cares...

		preserveModules: false, // We want to bundle everything into one bundle, so this should be false!
	},
	plugins: [
		typescript({
			compilerOptions: {
				outDir,
				//module: 'es6',
				target: 'es5'
			}
		}),
		/*hash({
			//algorithm: 'sha1' // md5, sha1 (default), sha256, sha512
			callback: (hashedFilename) => {
				console.debug('hashedFilename', hashedFilename);
			},

			//dest: '[name].[hash:8].js',
			dest: 'build/resources/main/assets/react4xp/react4xpClient.[hash].js',

			manifest: 'build/resources/main/assets/react4xp/client.manifest.json',
			replace: true // false is default
		}),*/
		//commonjs(),
		outputManifest({
			//basePath: '', // default is '' // A path prefix for all keys. Useful for including your output path in the manifest.

			fileName: 'executor.manifest.json', // default is 'manifest.json'

			//filter: (bundle)=>{boolean}, //
			//generate: (keyValueDecorator: KeyValueDecorator, seed: object, opt: OutputManifestParam) => (chunks: Bundle[]) => object // Create the manifest. It can return anything as long as it's serialisable by JSON.stringify.
			//isMerge: true, // default is false // Merge the existing key/value pair in the target manifest file or just override it.
			//keyValueDecorator: (k: string, v: string, opt: OutputManifestParam)=>{[k: string]: string}, // You can set your own rule to set key/value.
			//map: (bundle)=>{bundle}, //

			//nameSuffix: '', // default is '' // The suffix for all keys in the manifest json object.
			//nameWithExt: false, // default is true // Set an ext for key which is same as the value in manifest json object. We add this option for support of assets which has different ext than the entry.

			//publicPath: '', // default is outputOptions.dir || path.dirname(outputOptions.file)
			//publicSuffix: '', // default is '' // A suffix that will be added to values of the manifest. Useful for adding a query string, for example.

			//serialize: (manifest: object) => string
			//sort: (bundleA, bundleB)=>{number}, //
		})
	]
};
