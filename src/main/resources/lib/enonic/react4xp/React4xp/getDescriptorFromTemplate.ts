import type {ComponentType} from '/lib/enonic/react4xp/types/Component';


import {get as getContentByKey} from '/lib/xp/content';

import {templateDescriptorCache} from '/lib/enonic/react4xp/React4xp/templateDescriptorCache';


export function getDescriptorFromTemplate(
	componentType: ComponentType,
	templateId: string
) {
	return templateDescriptorCache.get(templateId, () => {
		if (!templateId) {
			log.warning(`Template ID is '${JSON.stringify(templateId)}'. Not ID of a template.`);
			return undefined;
		}
		if (componentType !== 'page') {
			log.warning(`Template ID '${templateId}' not accompanied by component type 'page' (component type is ${JSON.stringify(componentType)}).`);
			return undefined;
		}

		const content = getContentByKey({
			key: templateId
		});

		if (!content || content.type !== "portal:page-template") {
			log.warning(`Content not found or not a template (content.type!=="portal:page-template"). Template ID is '${JSON.stringify(templateId)}', retrieved content: ${JSON.stringify(content)}`);
			return undefined;
		}
		if (!content.page || content.page.type !== "page" || !(((content.page['descriptor'] || '') + '').trim())) {
			log.warning(`Template doesn't seem to have a page controller attached. Template ID is '${JSON.stringify(templateId)}', retrieved template content: ${JSON.stringify(content)}`);
			return undefined;
		}

		return content.page['descriptor'];
	});
}
