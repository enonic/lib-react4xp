export default {
	collectCoverageFrom: [
		'src/main/resources/**/*.ts',
		'!src/**/*.d.ts',
	],
	coverageProvider: 'v8',
	moduleNameMapper: {
		'/lib/enonic/react4xp/(.*)': '<rootDir>/src/main/resources/lib/enonic/react4xp/$1',
	},
	preset: 'ts-jest/presets/js-with-babel-legacy',
	testEnvironment: 'node',
	transform: {
		'^.+\\.(js|jsx|ts|tsx)$': [
			'ts-jest',
			{
				tsconfig: {
					sourceMap: true, // Needed to get correct Uncovered Line numbers
				}
			}
		]
	},
};
