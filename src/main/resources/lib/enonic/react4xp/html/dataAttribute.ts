import {attribute} from '/lib/enonic/react4xp/html/attribute';

export const dataAttribute = (
	name :string,
	value :string
) => attribute(`data-${name}`, value);
