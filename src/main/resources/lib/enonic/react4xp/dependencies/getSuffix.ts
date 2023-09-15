import { initServiceUrlRoot } from '/lib/enonic/react4xp/dependencies/initServiceUrlRoot';
import { stripSlashes } from '/lib/enonic/react4xp/dependencies/stripSlashes';


let LOGGEDWARNING = false;

// Strips away the beginning of a service URL - the root path of the service - and returns everything after that,
// to pick up path variations not picked up in req.params, e.g. asset names after a slash.
//
// Why? For now (6.15.x), lib-router doesn't work properly in service controllers. And since portal.serviceUrl is not
// entirely consistent across calling contexts, the incoming core service path may not necessarily match the above
// constants. Hence, the workaround.
//
// Returns empty string if there is no suffix. Strips slashes from both ends.
// Throws an error if the path doesn't match any known variation of the service path.
// Logs a warning when the fallback is used.
export function getSuffix({
	path,
	serviceName,
	type = 'server'
}: {
	path: string,
	serviceName: string
	type?: 'server' | 'absolute'
}) {
	//log.debug('getSuffix(%s, %s)', path, serviceName);

	const standardRoot = initServiceUrlRoot({
		serviceName,
		type
	}).replace(/\/$/, '');
	//log.debug('getSuffix(%s, %s) standardRoot:%s', path, serviceName, standardRoot);

	let location = path.indexOf(standardRoot);
	if (location !== -1) {
		return stripSlashes(path.substring(location + standardRoot.length));
	}

	const fallbackRoot = `/_/service/${app.name}/${serviceName}`;
	location = path.indexOf(fallbackRoot);
	if (location !== -1) {
		if (!LOGGEDWARNING) {
			log.warning(`Fallback: matched path '${path}' with service name '${serviceName}', returning suffix after service name. This will not be logged again.`);
			LOGGEDWARNING = true;
		}
		return stripSlashes(path.substring(location + fallbackRoot.length));
	}

	throw new Error(`Unexpected service suffix lookup: requested path ('${path}') doesn't seem to belong to the service '${serviceName}'.`);
};
