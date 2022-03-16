import {warmUpSync} from '/lib/enonic/react4xp/ssr/warmUpSync';
//import {nanoTime} from '/lib/enonic/xp/time/nanoTime';
//@ts-ignore
import {executeFunction} from '/lib/xp/task'


export function warmUpAsync() {
	executeFunction({
		description: 'Warm up React4xp Server side rendering',
		func: () => {
			//log.debug('Warming up React4xp Server side rendering...');
			//const startTime = nanoTime();
			warmUpSync(); // This actually is asyncronous, returns after 70ms and continues warming up some more seconds.
			//const endTime = nanoTime();
			//const duration = endTime - startTime;
			//log.debug('Finished warming up React4xp Server side rendering. duration in ms:%s', duration/1000000);
		}
	});
}
