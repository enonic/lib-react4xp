// import {toStr} from '@enonic/js-utils/value/toStr';
import {getClientChunkFilename} from '/lib/enonic/react4xp/asset/client/getClientChunkFilename';
import {getExecutorChunkFilename} from '/lib/enonic/react4xp/asset/executor/getExecutorChunkFilename'
import {getGlobals} from '/lib/enonic/react4xp/asset/getGlobals';
import {getImmutableDependencies} from '/lib/enonic/react4xp/asset/getImmutableDependencies';


export function getImmutables(entries: string[]) {
	const dependencies = getImmutableDependencies(entries);
	// log.debug('getImmutables dependencies:%s', toStr(dependencies));

	const globals = getGlobals();
	// log.debug('getImmutables globals:%s', toStr(globals));

	const clientChunkFilename = getClientChunkFilename();
	// log.debug('getImmutables clientChunkFilename:%s', toStr(clientChunkFilename)); // client-47ERBIZ7.global.js

	const executorChunkFilename = getExecutorChunkFilename();
	// log.debug('getImmutables executorChunkFilename:%s', toStr(executorChunkFilename)); // executor-O7SLEQAY.js

	const immutables = {};

	// NOTE: If the build system is changed to build client and executor without
	// contenthash in dev mode, these two lines must be updated:
	immutables[clientChunkFilename] = true;
	immutables[executorChunkFilename] = true;

	for (let i = 0; i < dependencies.length; i++) {
		const dependency = dependencies[i];
		immutables[dependency] = true;
	}

	for (let i = 0; i < globals.length; i++) {
		const global = globals[i];
		if (global !== 'globals') {
			immutables['globals'] = true; // without hash is not immutable
		}
	}

	return immutables;
}
