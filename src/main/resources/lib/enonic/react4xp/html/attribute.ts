export const attribute = (
	name :string,
	value :string,
	quote :string = '"'
) => `${name}=${quote}${value}${quote}`;
