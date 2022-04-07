import {
	anyQuote,
	beforeAttribute
} from '/lib/enonic/react4xp/html/regexp'


const BEFORE_ID = beforeAttribute('id');


export function hasElementWithId({
	id,
	htmlString
} : {
	id: string,
	htmlString :string
}) :boolean {
	const reStr = `${BEFORE_ID}${id}${anyQuote}`;
    const regExp = new RegExp(reStr, 'i');
    return !!htmlString.match(regExp);
}
