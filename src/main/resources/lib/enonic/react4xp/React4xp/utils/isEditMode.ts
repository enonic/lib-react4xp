import type { Request } from '/types/Request.d';


export default function isEditMode(request?: Request) {
	return !request || !request.mode || request.mode === 'edit';
}
