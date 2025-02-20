import type {React4xp} from '../../React4xp';


export default function makeErrorMessage(
	this: React4xp,
	attribute: string
) {
	return `Couldn't construct React4xp data: missing or invalid ${attribute}. ${
		this.isPage
			? `Trying to handle a page controller template without a jsxPath string 'entry' parameter in the constructor - but that's usually okay. However, an in-construtor call to portal.getContent() returned data without a content.page. ${attribute} attribute, so no jsxPath can be derived. Content`
			: `No jsxPath string 'entry' parameter was given to the React4xp constructor - but that's usually okay. However, component data (either from the 'entry' parameter or from an in-constructor portal.getComponent() call) is missing a component. ${attribute} attribute, so no jsxPath can be derived. Component`
		} data: ${JSON.stringify(this.component)}`;
}
