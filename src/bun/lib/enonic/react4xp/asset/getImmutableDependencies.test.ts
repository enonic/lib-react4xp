import {describe} from '@jest/globals';
import {
  expect,
  it,
} from 'bun:test';
import {getImmutableDependencies} from '/lib/enonic/react4xp/asset/getImmutableDependencies';

describe('getImmutableDependencies', () => {
	it('returns dependencies which has contenthash in filename', () => {
		expect(getImmutableDependencies([])).toEqual([
			'site/parts/example/example.db34cf922.css',
			'site/parts/software-show/software-show.d6607ab772af6315d3c7.js'
		]);

		// Passed in entries: string[] only matters if it contains an asset assumed to be immutable
		// TODO: Do not know what that logic is used for...
		expect(getImmutableDependencies(['site/parts/software-show/software-show.d6607ab772af6315d3c7.js'])).toEqual([
			'site/parts/example/example.db34cf922.css'
		]);

		expect(getImmutableDependencies(['site/parts/software-show/software-show'])).toEqual([
			'site/parts/example/example.db34cf922.css',
			'site/parts/software-show/software-show.d6607ab772af6315d3c7.js'
		]);
	});
});
