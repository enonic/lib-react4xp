import type { PageComponent } from '@enonic-types/core';
import type { PageTemplateContent } from '@enonic-types/lib-react4xp';

import {get as getContentByKey} from '/lib/xp/content';
import { pageTemplateContentIdToPageComponentCache } from '/lib/enonic/react4xp/pageTemplate/pageTemplateContentIdToPageComponentCache';



export const getCachedPageComponentFromPageTemplateContentId = ({
	pageTemplateContentId
}: {
	pageTemplateContentId: string
}): PageComponent => pageTemplateContentIdToPageComponentCache.get(pageTemplateContentId, () => {
	const content = getContentByKey<PageTemplateContent>({
		key: pageTemplateContentId,
	});
	if (!content) {
		throw new Error(`Unable to find a page template for content id '${pageTemplateContentId}'!`);
	}
	if (content.type !== 'portal:page-template') {
		throw new Error(`Content not a page template! Content ID:'${pageTemplateContentId}'`);
	}
	return content.page;
});
