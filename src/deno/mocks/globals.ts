import type {App, DoubleUnderscore, Log} from '../global.d.ts';

declare namespace globalThis {
	let app: App
	let log: Log
	let __: DoubleUnderscore
	let _devMode: boolean
	let _resources: Record<string, {
		bytes?: string
		exists?: boolean
	}>
}

globalThis.app = {
	config: {},
	name: 'com.enonic.app.react4xp',
	version: '1.0.0',
}

globalThis._devMode = false;

const isObject = (value: unknown): value is Record<string, unknown> => {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

globalThis.__ = {
	// @ts-expect-error To lazy to type this
	newBean: (bean: string) => {
		if (bean === 'com.enonic.lib.react4xp.AppHelper') {
			return {
				isDevMode: () => globalThis._devMode,
				getXpHome: () => '/tmp/xphome'
			}
		}
		throw new Error(`Unmocked bean:${bean}!`);
	},
	nullOrValue: <T = object>(v: T) => {
		console.error(`nullOrValue value:${JSON.stringify(v, null, 4)}`);
		return v;
	},
	toNativeObject: <T>(v: T): T => {
		console.error(`toNativeObject value:${JSON.stringify(v, null, 4)}`);
		if (isObject(v)) {
			return v as T;
		}
		/* coverage ignore next */
		throw new Error(`toNativeObject: Unmocked value:${JSON.stringify(v, null, 4)}!`);
	},
	toScriptValue: <T = object>(v: T): ScriptValue => {
		console.error(`toScriptValue value:${JSON.stringify(v, null, 4)}`);
		return v as ScriptValue;
	},
};
