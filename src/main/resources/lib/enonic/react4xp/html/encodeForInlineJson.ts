// https://www.html.am/reference/html-special-characters.cfm

export const encodeForInlineJson = (obj) => JSON.stringify(obj)
	.replace(/</g,'&#60;');
