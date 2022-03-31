import {IS_DEV_MODE} from '/lib/enonic/xp/runMode';


export function buildContainer({
	id,
	command = 'render',
	content = '',
	hasRegions = '0', // boolean using 0 for false and 1 for true, for the sake of more compact client-side .render and .hydrate calls.
	isPage = '0', // boolean using 0 for false and 1 for true, for the sake of more compact client-side .render and .hydrate calls.
	jsxPath,
	propsObj
} :{
	id :string,
	content? :string
	command? :string
	hasRegions? :string
	isPage? :string
	jsxPath? :string
	propsObj? :object
}) {
	return `<div
	data-command="${command}"
	data-dev-mode="${IS_DEV_MODE ? '1' : '0'}"
	data-has-regions="${hasRegions}"
	data-is-page="${isPage}"
	data-jsx-path="${jsxPath}"${
		propsObj
			? `
	data-props-json='${JSON.stringify(propsObj)}'` // Yes the single-quotes are on purpose
			: ''
	}
	id="${id}"
>${content}</div>`;
}
