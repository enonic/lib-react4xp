import {describe, expect, jest, test as it} from '@jest/globals';

jest.mock('/lib/enonic/react4xp/asset/executor/getExecutorUrl', () => ({
	getExecutorUrl: () => '/_/service/com.example.myproject/react4xp/executor.js'
}));

jest.mock('/lib/enonic/react4xp/pageContributions/buildPageContributions', () => ({
	buildPageContributions: ({entries, suppressJS}: {entries: string[], suppressJS: boolean}) => ({
		headEnd: suppressJS ? [] : entries.map(entry => `<script defer src="/${entry}.js"></script>\n`)
	})
}));

import {getAndMerge} from '/lib/enonic/react4xp/pageContributions/getAndMerge';

const EXECUTOR = '<script defer src="/_/service/com.example.myproject/react4xp/executor.js"></script>\n';

describe('getAndMerge', () => {
	it('adds the executor last when JS is not suppressed', () => {
		const result = getAndMerge({
			entryNames: 'Header',
			incomingPgContrib: {},
			newPgContrib: {bodyEnd: ['<script>header</script>']},
			suppressJS: false
		});
		expect(result.bodyEnd).toEqual(['<script>header</script>', EXECUTOR]);
	});

	it('does not add the executor when JS is suppressed and no previous rendering needed it', () => {
		const result = getAndMerge({
			entryNames: 'Footer',
			incomingPgContrib: {},
			newPgContrib: {},
			suppressJS: true
		});
		expect(result.bodyEnd).toEqual([]);
	});

	it('keeps the executor last when a previous rendering needed it and the current one suppresses JS', () => {
		const header = getAndMerge({
			entryNames: 'Header',
			incomingPgContrib: {},
			newPgContrib: {},
			suppressJS: false
		});
		expect(header.bodyEnd).toEqual([EXECUTOR]);

		const footer = getAndMerge({
			entryNames: 'Footer',
			incomingPgContrib: header,
			newPgContrib: {bodyEnd: ['<script>footer</script>']},
			suppressJS: true
		});
		expect(footer.headEnd).toEqual(['<script defer src="/Header.js"></script>\n']);
		expect(footer.bodyEnd).toEqual(['<script>footer</script>', EXECUTOR]);
	});

	it('does not duplicate the executor when chaining two renderings that both need it', () => {
		const header = getAndMerge({
			entryNames: 'Header',
			incomingPgContrib: {},
			newPgContrib: {},
			suppressJS: false
		});
		const footer = getAndMerge({
			entryNames: 'Footer',
			incomingPgContrib: header,
			newPgContrib: {},
			suppressJS: false
		});
		expect(footer.bodyEnd).toEqual([EXECUTOR]);
	});
});
