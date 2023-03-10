export namespace Application {
	export interface Config {
		readonly [key :string] : string | undefined
	}
	export type Key = string
	export type Version = string
}

export interface App {
	readonly config :Application.Config
	readonly name :Application.Key
	readonly version :Application.Version
}
