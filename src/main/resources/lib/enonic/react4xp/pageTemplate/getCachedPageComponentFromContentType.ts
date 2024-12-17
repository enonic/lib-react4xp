import type { PageComponent } from '@enonic-types/core';
import type { PageTemplateContent } from '/types';

import {
	query as queryContent,
} from '/lib/xp/content';
import { contentTypeToPageComponentCache } from '/lib/enonic/react4xp/pageTemplate/contentTypeToPageComponentCache';


export const getCachedPageComponentFromContentType = ({
	contentType,
}: {
	contentType: string,
}): PageComponent => contentTypeToPageComponentCache.get(contentType, () => {
	const {
		// count,
		hits,
		total,
	} = queryContent<PageTemplateContent>({
		count: 1,
		query: {
			boolean: {
				must: [
					{
						term: {
							field: 'type',
							value: 'portal:page-template'
						}
					},
					{
						term: {
							field: 'data.supports',
							value: contentType
						}
					}
				]
			}
		},
		sort: {
			field: 'manualOrder',
		}
	});
	if (total > 0) {
		return hits[0].page;
	}
	throw new Error(`Unable to find a page template for content type '${contentType}'!`);
});
