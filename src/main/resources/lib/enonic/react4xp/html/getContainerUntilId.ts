//import {toStr} from '@enonic/js-utils/value/toStr';
import {
	anyQuote,
	beforeAttribute
} from '/lib/enonic/react4xp/html/regexp'


const BEFORE_ID = beforeAttribute('id');


export function getContainerUntilId({
	id,
	htmlString
} : {
	id: string,
	htmlString :string
}) :string|null{
	/*log.debug(`getContainerUntilId({
		id:%s,
		htmlString:%s
	})`, id, htmlString);*/

	const reStr = `${BEFORE_ID}${id}${anyQuote}`;
	//log.debug('getContainerUntilId() reStr:%s', reStr);

	const react4xpPattern = new RegExp(reStr, 'i');

	const matches = htmlString.match(react4xpPattern);
	//log.debug('getContainerUntilId() matches:%s', toStr(matches));

    return matches ? matches[0] : null; // null or the first match
}
