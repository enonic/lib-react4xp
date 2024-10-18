// import type {assetUrl} from '@enonic-types/lib-portal';

export const assetUrl = ({
	path: _path,
	type = 'server',
}) => {
	if (type === 'server') {
		return globalThis._assetUrl;
	}
	return `http://localhost:8080${globalThis._assetUrl}`;
};
