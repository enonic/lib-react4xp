import type {ByteSource, ResourceKey} from '@enonic-types/lib-io';
import type {App, DoubleUnderscore, Log} from '../../../global.d.ts';

import {Resource} from '../../../mocks/Resource.ts';

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


export const getResource = (key: string | ResourceKey): Resource => {
	const resource = globalThis._resources[key as string];

	if (!resource) {
		throw new Error(`getResource: Unmocked key:${JSON.stringify(key, null, 4)}!`);
	}

	if (!resource.exists) {
		return new Resource({
			bytes: '',
			exists: false,
			key: key.toString(),
			size: 0,
			timestamp: 0,
		});
	}

	return new Resource({
		bytes: resource.bytes || '',
		exists: true,
		key: key.toString(),
		size: (resource.bytes || '').length,
		timestamp: 2,
	});
};

export const readText = (stream: ByteSource): string => {
	return stream as unknown as string;
};
