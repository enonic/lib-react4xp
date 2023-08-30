import type { ContentSecurityPolicy } from '/types';


function q(s: string) {
	return `'${s}'`;
}


export default function contentSecurityPolicy(csp: ContentSecurityPolicy) {
	return Object.keys(csp).map(k => {
		const v = csp[k];
		return `${k} ${Array.isArray(v) ? v.map(s =>q(s)).join(' ') : q(v)}`;
	}).join('; ')
}
