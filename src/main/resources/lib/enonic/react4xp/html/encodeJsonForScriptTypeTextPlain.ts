// Three consecutive doublequotes can never appear inside JSON.
// Which makes it perfect for encoding/decoding purposes.

export const encodeJsonForScriptTypeTextPlain = (obj) => JSON.stringify(obj)
	.replace(/</g,'"""');
