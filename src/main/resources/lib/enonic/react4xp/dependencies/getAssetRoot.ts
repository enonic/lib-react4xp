import { initServiceUrlRoot } from '/lib/enonic/react4xp/dependencies/initServiceUrlRoot';


export function getAssetRoot({
	type = 'server'
}: {
	type?: 'server' | 'absolute'
} = {}) {
	// log.debug('getAssetRoot({ type: %s })', type);
	return initServiceUrlRoot({
		serviceName: 'react4xp',
		type
	});
};
