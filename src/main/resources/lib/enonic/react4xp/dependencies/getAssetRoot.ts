import {initServiceUrlRoot} from '/lib/enonic/react4xp/dependencies/initServiceUrlRoot';


export function getAssetRoot() {
	//log.debug('getAssetRoot()');
    return initServiceUrlRoot('react4xp');
};
