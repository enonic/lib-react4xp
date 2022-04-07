import {buildContainer} from '/lib/enonic/react4xp/html/buildContainer';
import {encodeEntities} from '/lib/enonic/react4xp/html/encodeEntities';
import {dataAttributeObjToArr} from '/lib/enonic/react4xp/html/dataAttributeObjToArr';
import {getContainerUntilId} from '/lib/enonic/react4xp/html/getContainerUntilId';
import {
	insertAtEndOfRoot,
	insertInsideContainer
} from '/lib/enonic/react4xp/html/inserter';
import {IS_DEV_MODE} from '/lib/enonic/xp/runMode';


interface RenderTargetContainerParams {
	appendErrorContainer? :boolean
	body? :string // '' is Falsy // Html string that usually contains the target container (a DOM node with correct ID).
	clientRender? :boolean
	content? :string // '' is Falsy // Html string to insert inside the target container.
}


/**
 * Generates or modifies an HTML body, with a target container whose ID matches
 *  this component's react4xpId.
 *
 * If it already has a matching-ID target container, data-attributes are added
 *  (use this option and the setId method to control where in the body the react
 *  component should be inserted).
 *
 * If it doesn't have a matching container, a matching <div> will be inserted at
 *  the end of the body, inside the root element.
 *
 * If body is missing, a pure-target-container body is generated and returned.
 *
 * @returns adjusted or generated HTML body with rendered react component.
 */
export function renderTargetContainer(params :RenderTargetContainerParams) :string {
	const {
		appendErrorContainer = false,
		body = '', // '' is Falsy
		clientRender = true,
		content = '' // '' is Falsy
	} = params;
	//log.debug('renderTargetContainer clientRender:%s jsxPath:%s', clientRender, this.jsxPath);
	this.ensureAndLockId();

	const hasBody = ((body) + "").replace(/(^\s+)|(\s+$)/g, "") !== "";
	//log.debug('renderTargetContainer hasBody:%s jsxPath:%s', hasBody, this.jsxPath);

	const containerUntilId = getContainerUntilId({
		id: this.react4xpId,
		htmlString: body
	});
	//log.debug('renderTargetContainer containerUntilId:%s jsxPath:%s', containerUntilId, this.jsxPath);

	const hasContainerWithId = !!containerUntilId;
	//log.debug('renderTargetContainer hasBody:%s hasContainerWithId:%s jsxPath:%s', hasBody, hasContainerWithId, this.jsxPath);

	const command = clientRender ? 'render' : 'hydrate';
	const propsJson = this.props ? encodeEntities(this.props) : '{}';

	const container = buildContainer({
		content,
		command,
		hasRegions: this.hasRegions,
		id: this.react4xpId,
		isPage: this.isPage,
		jsxPath: this.jsxPath,
		propsJson
	});

	const output = (hasBody && hasContainerWithId)
		? undefined
		: appendErrorContainer
			? `<div id="${this.react4xpId}__error__" style="border:1px solid #8B0000; padding:15px; background-color:#FFB6C1">${
				content}${container})
			}</div>`
			: container;


	// If no (or empty) body is supplied: generate a minimal container body with only a target container element.
	if (!hasBody) {
		return output;
	}

	// If there is a body but it's missing a target container element:
	// Make a container and insert it right before the closing tag.
	if (!hasContainerWithId) {
		return insertAtEndOfRoot(body, output);
	}

	const arr = dataAttributeObjToArr({
		command,
		'dev-mode': IS_DEV_MODE ? '1' : '0',
		'has-regions': this.hasRegions,
		'is-page': this.isPage,
		'jsx-path': this.jsxPath,
		'props-json': propsJson
	});
	//log.debug('renderTargetContainer arr:%s jsxPath:%s', arr, this.jsxPath);

	const str = ` ${arr.join(' ')}`;
	//log.debug('renderTargetContainer str:%s jsxPath:%s', str, this.jsxPath);

	const modifiedBody = body.replace(containerUntilId, `${containerUntilId}${str}`);
	//log.debug('renderTargetContainer modifiedBody:%s jsxPath:%s', modifiedBody, this.jsxPath);

	if (content) {
		return insertInsideContainer(modifiedBody, content, this.react4xpId, appendErrorContainer);
	}

	//log.debug('renderTargetContainer() noContent jsxPath:%s', this.jsxPath);
	return modifiedBody
} // renderTargetContainer
