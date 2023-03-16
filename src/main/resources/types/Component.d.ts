import type {
	Component as ComponentFromPortal,
	Region
} from "@enonic-types/lib-portal";

export type ComponentType = 'fragment'|'layout'|'page'|'part'|'text'; // image? region?


export interface PageComponent<PageConfig extends object = object> {
	config: PageConfig
	descriptor: string
	path: string
	regions: Record<string,Region>
	template: string // TODO: Missing from lib-portal
	type: 'page'
}


export interface PartComponent<PartConfig extends object = object> {
	config: PartConfig
	descriptor: string
	path: string
	type: ComponentType
}


export interface TextComponent {
	path: string
	text: string
	type: 'text'
}

//export type ComponentGeneric = PageComponent & PartComponent// & TextComponent;
export interface ComponentGeneric extends ComponentFromPortal {
	template?: string // TODO: Missing from lib-portal
}

export type Component = PageComponent | PartComponent// | TextComponent;

// This is stricter than lib-portal
// interface Region<Name extends string = ''> {
// 	components: Array<PartComponent | TextComponent>
// 	name: Name
// }
