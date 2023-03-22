import type {Request} from '../../../../..';
import type {React4xp} from '../../React4xp';
import shouldRenderClientSide from '/lib/enonic/react4xp/React4xp/shouldRenderClientSide';


export function renderBody(this: React4xp, {
	body,
	clientRender,
	request
} :{
	body?: string
	clientRender?: boolean
	request?: Request
} = {}): string {
	// log.debug('renderBody clientRender:%s jsxPath:%s', clientRender, this.jsxPath);
	return shouldRenderClientSide({
		clientRender,
		request
	})
		? this.renderTargetContainer({
			body
		})
		: this.renderSSRIntoContainer({
			body,
			request
		});
} // renderBody
