export namespace Application {
	interface Config {
		readonly [key :string] :unknown
	}
	type Key = string
	type Version = string
}

export interface App {
	readonly config :Application.Config
	readonly name :Application.Key
	readonly version :Application.Version
}
