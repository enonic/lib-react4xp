import type {Request} from '../../../../..';
import type {React4xp} from '../../React4xp';
import shouldSSR from '/lib/enonic/react4xp/React4xp/shouldSSR';


export function renderBody(this: React4xp, {
	body,
	request,
	ssr,
} :{
	body?: string
	ssr?: boolean
	request?: Request
} = {}): string {
	// log.debug('renderBody ssr:%s jsxPath:%s', ssr, this.jsxPath);
	return shouldSSR({
		request,
		ssr
	})
		? this.renderSSRIntoContainer({
			body,
			request
		})
		: this.renderTargetContainer({
			body
		});
} // renderBody
