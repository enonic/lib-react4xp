import type {Request, Response} from '@enonic-types/core';

import {handleAssetRequest} from '/lib/enonic/react4xp/asset/handleAssetRequest';

export function get(req: Request): Response {
	return handleAssetRequest(req);
}
