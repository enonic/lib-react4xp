import type {
	MacroData,
	RichTextData
} from '@enonic/react-components';

export function replaceMacroComments(processedHtml: string): RichTextData {
	const rv: RichTextData = {
		processedHtml,
		macros: []
	};
	let index = 0;
	rv.processedHtml = processedHtml
		.replace(
			/<p>(<!--#MACRO (?:.*?\n?)*?-->)<\/p>/gm,
			'$1'
		)
		.replace(
			/<pre>(<!--#MACRO (?:.*?\n?)*?-->)<\/pre>/gm,
			'$1'
		)
		.replace(
			/<!--#MACRO ((?:.*?\n?)*?)-->/gm,
			(_origHtmlMacroComment, attributesString) => {
				// Replacer is executed once per match (macro comment)
				index++;
				const ref = index.toString();
				let name: string = '';
				const macro: Partial<MacroData> = {
					config: {},
					ref,
				};
				const replacedAttributes = attributesString.replace(
					/([^=]+)="([^"]*)"\s*/g,
					(_kv, key, value) => {
						// Replacer is executed once per match (attribute key/value)
						if (key === '_name') {
							name = value;
							macro.name = name;
							macro.descriptor = `whatever:${name}`;
							return `data-macro-name="${value}" data-macro-ref="${ref}"`;
						}
						if (key === '_document') {
							return '';
						}
						if (key === '_body') {
							key = 'body';
						}
						if (macro.config && name) {
							if (!macro.config[name]) {
								macro.config[name] = {};
							}
							macro.config[name][key] = value;
						}
						return '';
					}
				)
				const replacedMacro = `<editor-macro ${replacedAttributes}></editor-macro>`;
				if (rv.macros) {
					rv.macros.push(macro as MacroData);
				}
				return replacedMacro;
			} // single macro replacer
		);
	return rv;
}
