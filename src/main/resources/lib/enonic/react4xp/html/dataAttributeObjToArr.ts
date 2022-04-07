import {dataAttribute} from '/lib/enonic/react4xp/html/dataAttribute';


type AttributesObj = {}|{[name: string]: string}


export function dataAttributeObjToArr(dataAttributes :AttributesObj) {
	const keys = Object.keys(dataAttributes);
	const arr = [];
	for (let i = 0; i < keys.length; i++) {
	    const key = keys[i];
		arr.push(dataAttribute(key, dataAttributes[key]));
	}
	return arr;
}
