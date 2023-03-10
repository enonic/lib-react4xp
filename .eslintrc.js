module.exports = {
	extends: [
		//'eslint:recommended',
		//'airbnb-base',
		'plugin:@typescript-eslint/eslint-recommended',
		'plugin:@typescript-eslint/recommended',
	],

	overrides: [{
		files: [
			'**/*.ts',
			// '**/*.tsx'
		]
	}],

	root: true,

	rules: { // https://eslint.org/docs/rules
		// sucrase doesn't support transforming destructuring
		// But this doesn't help
		// 'prefer-destructuring': ['error', {
		// 	array: false,
		// 	object: false,
		// }]
	},
}
