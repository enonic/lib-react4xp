import type { React4xp } from '@enonic-types/lib-react4xp';


export function renderWarningPlaceholder(this: React4xp) {
	const {jsxPath, react4xpId} = this;
	return `<div class="react4xp-warning">
	<style>
		.react4xp-warning {
			background-color:#ffffb6;
			border: 1px solid #8b8b00;
			color: #000;
			font-family:monospace;
			font-size:12px;
			padding:1em;
		}
	</style>
	<p>
		This React4xp component "<strong>${jsxPath}</strong>" (with id <strong>${react4xpId}</strong>) is configured to be rendered client-side and is thus disabled in Content Studio edit mode.
	</p>
</div>`;
}
