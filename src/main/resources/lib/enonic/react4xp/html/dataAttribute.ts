import {attribute} from '/lib/enonic/react4xp/html/attribute';

export const dataAttribute = (
	name :string,
	value :string,
	quote :string = "'" // Singlequote as default because it may be JSON.
) => attribute(`data-${name}`, value, quote);
