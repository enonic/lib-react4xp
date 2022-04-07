export const anyQuote = '["\']'
export const anythingButGt = '[^>]'
export const space = '\\s'; // Double backslash is needed to keep the backslash

export const atLeastOne = (r :string) => `${r}+`
export const optional = (r :string) => `${r}*`

export const atLeastOneSpace = atLeastOne(space);
export const optionalSpace = optional(space);

export const beforeAttribute = (name :string) => `<${anythingButGt}+${
	atLeastOneSpace}${name}${optionalSpace}=${optionalSpace}${anyQuote}`;

export const lookahead = (r :string) => `(?=${r})`;

// https://regex101.com/ This construct may not be supported in all browsers.
// Looks like lookahead doesn't work in Nashorn :(
//const lookbehind = (r :string) => `(?<=${r})`;
