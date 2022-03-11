import type {React4xp as React4xpNamespace} from '../../../../../index.d';


// TODO DEPRECATED! Remove at 3.0.0
export function renderEntryToHtml<
	Props extends {
		react4xpId? :React4xpNamespace.Id
	} = {}
>(overrideProps? :Props) {
	const { html, error } = this.doRenderSSR(overrideProps);
	return error ? undefined : html;
}
