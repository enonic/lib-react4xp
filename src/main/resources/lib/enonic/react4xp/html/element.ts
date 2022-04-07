import {attributeObjToArr} from '/lib/enonic/react4xp/html/attributeObjToArr';
import {dataAttributeObjToArr} from '/lib/enonic/react4xp/html/dataAttributeObjToArr';


export function element({
	attributes = {},
	content = '',
	dataAttributes = {},
	tag = 'div'
} :{
	attributes? :{}|{[name: string]: string}
	content? :string
	dataAttributes? :{}|{[name: string]: string}
	tag? :string
}) {
	const arr = attributeObjToArr(attributes).concat(dataAttributeObjToArr(dataAttributes));
	let str = arr ? ` ${arr.join(' ')}`: '';
	return `<${tag}${str}>${content}</${tag}>`;
};
