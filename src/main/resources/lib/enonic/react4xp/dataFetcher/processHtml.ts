import type {RichTextData} from '@enonic/react-components';
import {processHtml as portalProcessHtml, ProcessHtmlParams as PortalProcessHtmlParams} from '/lib/xp/portal';
import {dataFromProcessedHtml} from '/lib/enonic/react4xp/dataFetcher/dataFromProcessedHtml';

export type ProcessHtmlParams = PortalProcessHtmlParams | string;

export function processHtml(params: ProcessHtmlParams): RichTextData {
	const normParams = typeof params === 'string' ? {value: params} : params;

	if (!normParams?.value?.length) {
		return {
			processedHtml: '',
			macros: [],
			images: [],
			links: [],
		}
	}

	const processedHtml = portalProcessHtml(normParams);
	return dataFromProcessedHtml(processedHtml);
}
