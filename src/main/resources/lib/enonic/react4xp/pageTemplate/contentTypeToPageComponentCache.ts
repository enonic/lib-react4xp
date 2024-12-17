import type {Cache} from '/lib/enonic/react4xp/types/Cache';

// @ts-expect-error No types available for this module
import {newCache}  from '/lib/cache';

// Key is contentType, value is a page component.
export const contentTypeToPageComponentCache = newCache({
	size: 100,
	expire: 600 // 60*10 = 10 minutes
}) as Cache;
