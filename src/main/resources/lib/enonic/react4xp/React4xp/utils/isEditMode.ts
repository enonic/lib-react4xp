import type { Request } from '@enonic-types/lib-react4xp';


export default function isEditMode(request?: Request) {
	return !request || !request.mode || request.mode === 'edit';
}
