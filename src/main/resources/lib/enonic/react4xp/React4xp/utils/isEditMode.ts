import type {Request} from '@enonic-types/core';


export default function isEditMode(request?: Request) {
	return !request || !request.mode || request.mode === 'edit';
}
