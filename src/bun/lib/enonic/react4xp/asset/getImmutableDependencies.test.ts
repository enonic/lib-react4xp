import {describe} from '@jest/globals';
import {
  expect,
  it,
} from 'bun:test';
import {getImmutableDependencies} from '../../../../../main/resources/lib/enonic/react4xp/asset/getImmutableDependencies';

describe('getImmutableDependencies', () => {
	it('should work', () => {
		expect(getImmutableDependencies([])).toEqual(['site/parts/software-show/software-show.d6607ab772af6315d3c7.js']);

		// Passed in entries: string[] only matters if it contains an asset assumed to be immutable
		// TODO: Do not know what that logic is used for...
		expect(getImmutableDependencies(['site/parts/software-show/software-show.d6607ab772af6315d3c7.js'])).toEqual([]);

		expect(getImmutableDependencies(['site/parts/software-show/software-show'])).toEqual(['site/parts/software-show/software-show.d6607ab772af6315d3c7.js']);
	});
});
