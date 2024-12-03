import type {
	ImageContent,
	ImageData,
	MacroData,
	RichTextData
} from '@enonic/react-components/types/RichText';
import {get as getContentByKey} from '/lib/xp/content';


export function dataFromProcessedHtml(processedHtml: string): RichTextData {
	const rv: RichTextData = {
		processedHtml,
		macros: [],
		images: [],
		links: [],
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

		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/match
	// If the g flag is used, all results matching the complete regular expression will be returned, but capturing groups are not included.
	rv.processedHtml = rv.processedHtml.replace(/<img((?:.*?\n?)*?)\/?>/gm,
		(_origImgString, imgAttributesString) => {
			// Replacer is executed once per match (img element)
			index++;
			const ref = index.toString();

			const srcMatches = imgAttributesString.match(/src="((?:.*?\n?)*?)"/m);
			if (!srcMatches) {
				throw new Error(`No src attribute found in imgAttributesString:${imgAttributesString}!`);
			}
			const [_fullSrc, src] = srcMatches;
			// (log||console).debug('src:%s', src);

			const idMatches = src.match(/_\/image\/([0-9a-f-]+)/);
			// (log||console).debug('idMatches:%s', idMatches);

			if (!idMatches) {
				throw new Error(`No image id found in src:${src}!`);
			}
			const [_fullId, imageContentId] = idMatches;
			// (log||console).debug('imageContentId:%s', imageContentId);

			const imageContent: ImageContent = getContentByKey({ key: imageContentId });
			if (!imageContent) {
				throw new Error(`No image content found for id:${imageContentId}!`);
			}
			// (log||console).debug('imageContent:%s', imageContent);

			const image = {
				image: imageContent,
				ref,
				// style: null // TODO
			};
			rv.images.push(image as ImageData);
			const replacedImage = `<img${imgAttributesString} data-image-ref="${ref}">`;
			// (log||console).debug('replacedImage:%s', replacedImage);
			return replacedImage;
		});

	// NOTE content-links seems to work fine without any special handling

	return rv;
}
