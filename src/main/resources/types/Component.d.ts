export type ComponentType = 'fragment'|'layout'|'page'|'part'|'text'; // image? region?


export interface PageComponent<PageConfig extends {} = {}> {
	config :PageConfig
	descriptor :string
	path :string
	regions :Record<string,Region>
	template :string
	type :'page'
}


export interface PartComponent<PartConfig extends {} = {}> {
	config :PartConfig
	descriptor :string
	path :string
	type :ComponentType
}


export interface TextComponent {
	path :string
	text :string
	type :'text'
}

export type ComponentGeneric = PageComponent & PartComponent// & TextComponent;

export type Component = PageComponent | PartComponent// | TextComponent;


interface Region<Name extends string = ''> {
	components :Array<PartComponent | TextComponent>
	name :Name
}
