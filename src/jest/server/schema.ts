import type {
	// ContentSchemaType,
	// FormItem,
	FormItemInput,
	FormItemOptionSet,
	FormItemSet,
	// ListDynamicSchemasParams,
	MixinSchema,
	// XDataSchema,
} from '@enonic-types/lib-schema';
import type {
	GetComponentReturnType,
	NestedPartial
} from '../../main/resources/lib/enonic/react4xp/DataFetcher';

import {
	HTML_AREA_KEY,
	ITEM_SET_KEY,
	OPTION_SET_KEY,
} from './constants';


export const FORM_ITEM_INPUT: Partial<FormItemInput> = {
	formItemType: "Input",
	name: HTML_AREA_KEY,
	label: "My HtmlArea",
	maximize: true,
	inputType: "HtmlArea",
	occurrences: {
		maximum: 1,
		minimum: 0,
	},
	config: {},
};

export const FORM_ITEM_SET: Partial<FormItemSet> = {
	formItemType: "ItemSet",
	name: ITEM_SET_KEY,
	label: "Contact Info",
	occurrences: {
		maximum: 0,
		minimum: 0,
	},
	items: [
		FORM_ITEM_INPUT as FormItemInput,
	],
};

export const FORM_ITEM_OPTION_SET: FormItemOptionSet = {
	formItemType: "OptionSet",
	name: OPTION_SET_KEY,
	label: "Content blocks",
	expanded: false,
	helpText: "Create content with optional blocks",
	occurrences: {
		maximum: 0,
		minimum: 0,
	},
	selection: {
		maximum: 1,
		minimum: 1,
	},
	options: [
		{
			name: "hr",
			label: "Horisontal line",
			helpText: "Adds a separator between blocks",
			default: false,
			items: [],
		},
		{
			name: "text",
			label: "Text",
			default: false,
			items: [
				// @ts-expect-error
				FORM_ITEM_INPUT
			],
		},
	],
};

const FORM = [
	FORM_ITEM_INPUT,
	FORM_ITEM_SET,
	FORM_ITEM_OPTION_SET,
];

export const MIXIN_SCHEMAS: NestedPartial<MixinSchema[]> = [
	{
		name: "com.enonic.app.react4xp:mymixin",
		displayName: "My mixin",
		displayNameI18nKey: "",
		modifiedTime: "2024-11-05T07:23:42Z",
		resource:`<mixin>
	<display-name>My mixin</display-name>
	<form>
		<input name="anHtmlArea" type="HtmlArea">
			<label>AnHtmlArea</label>
		</input>
		<item-set name="anItemSet">
			<label i18n="anItemSet.label">AnItemSet</label>
			<occurrences minimum="0" maximum="0"/>
			<items>
				<input name="anHtmlArea" type="HtmlArea">
					<label>AnHtmlArea</label>
				</input>
			</items>
		</item-set>
		<option-set name="anOptionSet">
			<label>AnOptionSet</label>
			<occurrences minimum="0" maximum="0"/>
			<help-text>Create content with optional blocks</help-text>
			<options minimum="1" maximum="1">
				<option name="hr">
					<label>Horisontal line</label>
					<help-text>Adds a separator between blocks</help-text>
				</option>
				<option name="text">
					<label>Text</label>
					<items>
						<input name="anHtmlArea" type="HtmlArea">
							<label>AnHtmlArea</label>
						</input>
					</items>
				</option>
			</options>
		</option-set>
	</form>
</mixin>
`,
		type: "MIXIN",
		form: FORM,
	},
];

export const PART_SCHEMA: GetComponentReturnType = {
	key: "com.enonic.app.react4xp:example",
	displayName: "Example Part",
	displayNameI18nKey: "",
	componentPath: "com.enonic.app.react4xp:/site/parts/example",
	modifiedTime: "2024-11-04T07:55:16Z",
	resource: `<part>
	<display-name>Example Part</display-name>
	<form>
		<input name="anHtmlArea" type="HtmlArea">
			<label>My HtmlArea</label>
			<!-- <default><h3>Enter description here</h3></default>
        <config>
            <exclude>*</exclude>
            <include>JustifyLeft JustifyRight | Bold Italic</include>
            <allowHeadings>h2 h4 h6</allowHeadings>
        </config> -->
		</input>
	</form>
</part>
`,
	type: "PART",
	// form: FORM,
	form: [
		// {
		// 	formItemType: "InlineMixin",
		// 	name: "com.enonic.app.react4xp:mymixin",
		// },
		{
			formItemType: "Layout",
			name: "fieldSet30",
			label: "FieldSet",
			items: FORM,
		},
	],
	config: {},
};

export const LAYOUT_SCHEMA: GetComponentReturnType = {
	key: "com.enonic.app.react4xp:twoColumns",
	displayName: "Two columns",
	displayNameI18nKey: "",
	description: "Two columns react-rendered layout controller",
	descriptionI18nKey: "",
	componentPath: "com.enonic.app.react4xp:/site/layouts/twoColumns",
	modifiedTime: "2024-11-04T10:09:04Z",
	resource:
		`<layout>
	<display-name>Two columns</display-name>
	<description>Two columns react-rendered layout controller</description>
	<form>
		<input name="anHtmlArea" type="HtmlArea">
			<label>My HtmlArea</label>
		</input>
		<item-set name="anItemSet">
			<label i18n="anItemSet.label">Contact Info</label>
			<occurrences minimum="0" maximum="0"/>
			<items>
				<input name="anHtmlArea" type="HtmlArea">
					<label>My HtmlArea</label>
				</input>
			</items>
		</item-set>
	</form>
	<regions>
		<region name="left"/>
		<region name="right"/>
	</regions>
</layout>
		`,
	type: "LAYOUT",
	form: FORM,
	config: {},
	regions: ["left", "right"],
};

export const PAGE_SCHEMA: GetComponentReturnType = {
	key: "com.enonic.app.react4xp:default",
	displayName: "Default page",
	displayNameI18nKey: "",
	description: "Default react-rendered page controller",
	descriptionI18nKey: "",
	componentPath: "com.enonic.app.react4xp:/site/pages/default",
	modifiedTime: "2024-11-04T10:38:34Z",
	resource: `<page>
	<display-name>Default page</display-name>
	<description>Default react-rendered page controller</description>
	<form>
		<input name="anHtmlArea" type="HtmlArea">
			<label>My HtmlArea</label>
		</input>
		<item-set name="anItemSet">
			<label i18n="anItemSet.label">Contact Info</label>
			<occurrences minimum="0" maximum="0"/>
			<items>
				<input name="anHtmlArea" type="HtmlArea">
					<label>My HtmlArea</label>
				</input>
			</items>
		</item-set>
	</form>
	<regions>
		<region name="main"/>
	</regions>
</page>
`,
	type: "PAGE",
	form: FORM,
	config: {},
	regions: ["main"],
};
