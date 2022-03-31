import type {Request} from '../../../../..';


export function renderBody({
	body,
	clientRender,
	request
} :{
	body? :string
	clientRender? :boolean
	request? :Request
} = {}) :string {
	// The rendered body depends on the rendered context:
	// SSR is default behavior, but can be overriden by clientRender = true
	// - UNLESS request.mode reveals rendering in Content studio, which will enforce SSR.
	const viewMode = (request || {}).mode;
	return (
		!clientRender
		||
		viewMode === 'edit' || viewMode === 'inline'
	)
		? this.renderSSRIntoContainer({
			body,
			clientRender,
			react4xpObj: this,
			request
		})
		: this.renderTargetContainer({
			body,
			clientRender
		});
} // renderBody
