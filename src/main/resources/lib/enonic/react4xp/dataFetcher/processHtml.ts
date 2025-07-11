import {MacroData, ComponentDataAndProps, MacroComponentData, ExtendedRichTextData} from '@enonic/react-components';
import type {DataFetcher} from '/lib/enonic/react4xp/DataFetcher';
import {processHtml as portalProcessHtml, ProcessHtmlParams as PortalProcessHtmlParams} from '/lib/xp/portal';
import {dataFromProcessedHtml} from '/lib/enonic/react4xp/dataFetcher/dataFromProcessedHtml';
import type {Component, Merge} from '@enonic-types/core';

export type ProcessHtmlParams<OVERRIDES extends Record<string, unknown> = Record<string, never>> = PortalProcessHtmlParams & Merge<{
	dataFetcher: DataFetcher
	component?: Component;
}, OVERRIDES>;

export function processHtml({
								value,
								imageWidths,
								imageSizes,
								dataFetcher,
								component,
								type,
								...passAlong
							}: ProcessHtmlParams): ExtendedRichTextData {

	if (!value?.length) {
		return {
			processedHtml: '',
			macros: [],
			images: [],
			links: [],
			macroComponents: [],
		}
	}

	const processedHtml = portalProcessHtml({
		value,
		imageWidths,
		imageSizes,
		type
	});
	const richTextData = dataFromProcessedHtml(processedHtml);

	const macroComponents = (richTextData.macros || [])
		.map((macro: MacroData) => processMacro(macro, dataFetcher, passAlong, component))

	return {
		...richTextData,
		macroComponents
	};
}

function processMacro(macro: MacroData, dataFetcher: DataFetcher, passAlong: Record<string, unknown>,
					  component?: Component): ComponentDataAndProps<MacroComponentData> {

	const {name, descriptor, ref} = macro;
	const macroComponent: MacroComponentData = {
		type: 'macro',
		name,
		descriptor,
		ref
	};

	const result = {
		component: macroComponent,
	}

	if (!descriptor) {
		// Descriptor can be undefined until macros is initialized
		log.debug(`processHtml: processMacro: No descriptor for macro [${macroComponent.descriptor}] at: ${component?.path}`);
		return result;
	}

	const macroProcessor = dataFetcher.getMacro(macroComponent.descriptor);
	if (macroProcessor) {
		dataFetcher.invokeProcessor(result, macroProcessor, {...passAlong, macro}, component, 'data');
	}

	return result;
}
