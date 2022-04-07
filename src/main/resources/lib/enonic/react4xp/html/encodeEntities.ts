import {isString} from '@enonic/js-utils/value/isString';
import {encode} from 'html-entities';


export function encodeEntities(value :unknown) :string {
	const str = isString(value) ? value : JSON.stringify(value);
	return encode(
		str,
		{
			level: 'xml',
			mode: 'specialChars' // encodes only HTML special characters (default).
		});
}
