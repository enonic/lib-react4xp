// import {toStr} from '@enonic/js-utils/value/toStr';
import {getClientChunkFilename} from '/lib/enonic/react4xp/asset/client/getClientChunkFilename';
import {getExecutorChunkFilename} from '/lib/enonic/react4xp/asset/executor/getExecutorChunkFilename'
import {getExternals} from './getExternals';
import {getImmuteableDependencies} from './getImmuteableDependencies';


export function getImmuteables(entries: string[]) {
	const dependencies = getImmuteableDependencies(entries);
	// log.debug('getImmuteables dependencies:%s', toStr(dependencies));

	const externals = getExternals();
	// log.debug('getImmuteables externals:%s', toStr(externals));

	const clientChunkFilename = getClientChunkFilename();
	// log.debug('getImmuteables clientChunkFilename:%s', toStr(clientChunkFilename)); // client-47ERBIZ7.global.js

	const executorChunkFilename = getExecutorChunkFilename();
	// log.debug('getImmuteables executorChunkFilename:%s', toStr(executorChunkFilename)); // executor-O7SLEQAY.js

	const immuteables = {};

	// NOTE: If the build system is changed to build client and executor without
	// contenthash in dev mode, these two lines must be updated:
	immuteables[clientChunkFilename] = true;
	immuteables[executorChunkFilename] = true;

	for (let i = 0; i < dependencies.length; i++) {
		const dependency = dependencies[i];
		immuteables[dependency] = true;
	}

	for (let i = 0; i < externals.length; i++) {
		const external = externals[i];
		if (external !== 'externals.js') {
			immuteables[external] = true; // without hash is not immuteable
		}
	}

	return immuteables;
}
