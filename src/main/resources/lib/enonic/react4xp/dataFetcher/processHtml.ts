import type {RichTextData} from '@enonic/react-components';
import {processHtml as portalProcessHtml} from '/lib/xp/portal';
import {dataFromProcessedHtml} from '/lib/enonic/react4xp/dataFetcher/dataFromProcessedHtml';

export function processHtml(text: string): RichTextData {
	if (!text?.length) {
		return {
			processedHtml: '',
			macros: [],
			images: [],
			links: [],
		}
	}
	const processedHtml = portalProcessHtml({
		value: text
	});
	return dataFromProcessedHtml(processedHtml);
}
