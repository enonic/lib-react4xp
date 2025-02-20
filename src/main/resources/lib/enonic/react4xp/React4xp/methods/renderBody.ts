import type {Request} from '@enonic-types/core';
import type {React4xp} from '../../React4xp';
import isEditMode from '/lib/enonic/react4xp/React4xp/utils/isEditMode';
import getSsrConfig from '/lib/enonic/react4xp/React4xp/utils/getSsrConfig';


export function renderBody(this: React4xp, {
	body,
	request,
	ssr,
}: {
	body?: string
	ssr?: boolean
	request?: Request
} = {}): string {
	// log.debug('renderBody ssr:%s jsxPath:%s', ssr, this.jsxPath);

	const editMode = isEditMode(request);

	// If the entry is a page or layout, and ssr is not explicitly
	// passed as a render option, it will set ssr to false.
	// Which means app.config['react4xp.ssr'] should not matter for
	// pages and layouts.
	// WARNING: If renderBody is called directly, that logic is skipped.
	const finalSSR = getSsrConfig(ssr);

	// React components may interfere with CS UI when editing content.
	// In such cases r4x defaults to SSR without hydration.
	// Some components are however "pure" clientSide components and may import
	// assets which aren't available serverSide, so r4x cannot fallback to SSR.
	// In such cases a placeholder is used.

	// For renderBody there are 3 outcomes:
	// 1. Placeholder (for clientSide components in CS Edit mode)
	// 2. SSR
	// 3. Just container
	return (editMode && !finalSSR)
		? this.renderWarningPlaceholder()
		: finalSSR
			? this.renderSSRIntoContainer({
				body,
				request
			})
			: this.renderTargetContainer({
				body
			});
} // renderBody
