import {
	// beforeAll,
	// afterAll,
	describe,
	expect,
	test as it
} from '@jest/globals';
import toDiffableHtml from 'diffable-html';

import {replaceMacroComments} from '/lib/enonic/react4xp/replaceMacroComments';

describe('replaceMacroComments', () => {
	it('should replace macro comments', () => {
		const replaced = replaceMacroComments(`<p><!--#MACRO _name="info" header="Header1" _document="__macroDocument1" _body="Text1<br>
With<br>
Newlines"--></p>
<pre><!--#MACRO _name="info" header="Header2" _document="__macroDocument1" _body="Text2<br>
With<br>
Newlines"--></pre>`);
		replaced.processedHtml = toDiffableHtml(replaced.processedHtml);
		expect(replaced)
			.toEqual({
				processedHtml: toDiffableHtml(`
					<editor-macro data-macro-name="info" data-macro-ref="1"></editor-macro>
					<editor-macro data-macro-name="info" data-macro-ref="2"></editor-macro>
				`),
				macros: [
					{
						"ref": "1",
						"name": "info",
						"descriptor": "whatever:info",
						"config": {
							"info": {
								"body": "Text1<br>\nWith<br>\nNewlines",
								"header": "Header1"
							}
						}
					},
					{
						"ref": "2",
						"name": "info",
						"descriptor": "whatever:info",
						"config": {
							"info": {
								"body": "Text2<br>\nWith<br>\nNewlines",
								"header": "Header2"
							}
						}
					}
				]
			});
	}); // it
}); // describe
