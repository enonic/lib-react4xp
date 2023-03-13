export interface Props {
	regionsData: {
		[regionName: string]: {
			components: Array<{
				descriptor: string
				path: string
			}>
		}
	}
}
export type ComponentFunction = (props: Props) => void;
export interface ComponentObject {
	default: ComponentFunction|unknown
}
export type Component = ComponentFunction|ComponentObject|unknown;


export interface Entry {
	props: Props
	targetId: string
}
export interface Entries {
	[entryName: string]: Entry
}

export interface Region {
	innerHTML: string
}
export interface RegionsBuffer {
	[regionName: string]: string
}
export interface RegionsRemaining {
	[regionName: string]: number
}

export interface ScriptElement extends HTMLScriptElement {
	onload: ()=>void
	onreadystatechange: ()=>void
	readyState: 'complete'|'loaded'
	src: string
	type: 'text/javascript'
}

export interface StyleElement extends HTMLLinkElement {
	href: string
	onload: ()=>void
	onreadystatechange: ()=>void
	readyState: 'complete'|'loaded'
	rel: 'stylesheet'
	type: 'text/css'
}
