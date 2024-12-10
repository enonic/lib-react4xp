//import {R4X_TARGETSUBDIR} from '@enonic/react4xp';
export const R4X_TARGETSUBDIR = 'r4xAssets';

const RESOURCE_NAME_CLIENT_MANIFEST_JSON = 'client.manifest.json';
const RESOURCE_NAME_EXECUTOR_MANIFEST_JSON = 'executor.manifest.json';
export const RESOURCE_PATH_ABSOLUTE_CLIENT_MANIFEST_JSON = `/${R4X_TARGETSUBDIR}/${RESOURCE_NAME_CLIENT_MANIFEST_JSON}`;
export const RESOURCE_PATH_ABSOLUTE_EXECUTOR_MANIFEST_JSON = `/${R4X_TARGETSUBDIR}/${RESOURCE_NAME_EXECUTOR_MANIFEST_JSON}`;

//export const RESOURCE_PATH_ABSOLUTE_NASHORNPOLYFILLS_DEFAULT = '/lib/enonic/react4xp/nashornPolyfills.js'; // Hardcoded in Java

export enum REQUEST_METHOD {
	GET = 'GET',
	POST = 'POST',
	PUT = 'PUT',
	DELETE = 'DELETE',
	OPTIONS = 'OPTIONS',
	HEAD = 'HEAD',
	PATCH = 'PATCH',
	TRACE = 'TRACE',
	CONNECT = 'CONNECT',
};

export enum REQUEST_MODE {
	EDIT = 'edit',
	INLINE = 'inline',
	LIVE = 'live',
	PREVIEW = 'preview',
}
