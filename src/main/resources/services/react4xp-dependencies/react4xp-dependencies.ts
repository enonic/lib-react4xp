// The service /dependencies has two modes:
//   - 'dependencies/urls' returns an array of dependency URLS.
//   - just 'dependencies' will return them as HTML script tags.

import type {
	Request,
	Response
} from '@enonic-types/core';


import { getComponentChunkUrls } from '/lib/enonic/react4xp/dependencies/getComponentChunkUrls';
import { getSuffix } from '/lib/enonic/react4xp/dependencies/getSuffix';


const SERVICE_NAME = 'react4xp-dependencies';


export function get(req: Request): Response {
	let relativePath: string;
	try {
		relativePath = getSuffix({
			path: (req.path || "").trim(),
			serviceName: SERVICE_NAME
			// urlType // NOTE: No way to select urlType in this service, will use app.config['react4xp.urlType'] || 'server'.
		});
		log.info(`relativePath:%s`, relativePath);
	} catch (e) {
		log.warning(`STATUS 400: ${e.message}`);
		return {
			status: 400,
			body: e.message,
			contentType: 'text/plain'
		};
	}

	// Gets parameter entryNames. Legal syntaxes: both
	//   .../react4xp-dependencies/entry1&entry2&entry3
	// ...and...
	//   .../react4xp-dependencies?entry1&entry2&entry3
	// Parameters that have values will not be interpreted as an entry name request.
	const params = req.params || {};
	const entryNames = Object.keys(params)
		.filter(key => params[key] != null
			&& ((params[key] || "") + "").trim() === ""
		);
	relativePath.split("&").forEach(entryName => {
		if (entryName.trim() !== "" && entryNames.indexOf(entryName) === -1) {
			entryNames.push(entryName);
		}
	});

	try {
		return {
			body: JSON.stringify(getComponentChunkUrls(
				entryNames // ,
				// { urlType } // NOTE: No way to select urlType in this service, will use app.config['react4xp.urlType'] || 'server'.
			)),
			contentType: 'application/json',
			// FIXME: ETAG not working, using standard client cache instead, limited to 1 hour since it's not hashed
			headers: {
				'Content-Type': 'application/javascript;charset=utf-8',
				'Cache-Control': 'public, max-age=3600'
			}
		};

	} catch (e) {
		log.warning(`STATUS 404: ${e.message}`);
		return {
			status: 404,
			body: e.message,
			contentType: 'text/plain'
		};
	}
}
