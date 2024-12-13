import type {Cache} from '@enonic-types/lib-react4xp';

// @ts-expect-error No types available for this module
import {newCache}  from '/lib/cache';

// Key is pageTemplateContentId, value is a page component.
export const pageTemplateContentIdToPageComponentCache = newCache({
	size: 100,
	expire: 600 // 60*10 = 10 minutes
}) as Cache;
