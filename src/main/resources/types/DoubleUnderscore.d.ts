export interface DoubleUnderscore {
	disposer :(fn :() => void) => void
	newBean :(string :string) => unknown
	nullOrValue :(value :unknown) => null|unknown
	registerMock :(name :string, value:unknown) => void
	toNativeObject :(value :unknown) => unknown
	toScriptValue :(value :unknown) => unknown
}
