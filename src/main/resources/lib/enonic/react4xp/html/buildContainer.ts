//import {toStr} from '@enonic/js-utils/value/toStr';
import {element} from '/lib/enonic/react4xp/html/element';
import {IS_DEV_MODE} from '/lib/enonic/xp/runMode';


export function buildContainer({
	id,
	command = 'render',
	content = '',
	hasRegions = '0', // boolean using 0 for false and 1 for true, for the sake of more compact client-side .render and .hydrate calls.
	isPage = '0', // boolean using 0 for false and 1 for true, for the sake of more compact client-side .render and .hydrate calls.
	jsxPath,
	propsJson = '{}'
} :{
	id :string,
	content? :string
	command? :string
	hasRegions? :string
	isPage? :string
	jsxPath? :string
	propsJson? :string
}) {
	const devMode = IS_DEV_MODE ? '1' : '0';
	/*log.debug(`buildContainer({
		id:%s,
		command:%s,
		hasRegions:%s,
		isPage:%s,
		jsxPath:%s
	}) devMode:%s`, id, command, hasRegions, isPage, jsxPath, devMode);*/
	//log.debug(`buildContainer({propsJson:%s})`, propsJson);
	return element({
		attributes: {
			id
		},
		dataAttributes: {
			command,
			'dev-mode': devMode,
			'has-regions': hasRegions,
			'is-page': isPage,
			'jsx-path': jsxPath,
			'props-json': propsJson
		},
		content//,
		//tag: 'div' // default is currently div
	});
}
