import {attribute} from '/lib/enonic/react4xp/html/attribute';


type AttributesObj = {}|{[name: string]: string}


export function attributeObjToArr(attributes :AttributesObj) {
	const keys = Object.keys(attributes);
	const arr = [];
	for (let i = 0; i < keys.length; i++) {
	    const key = keys[i];
		arr.push(attribute(key, attributes[key]));
	}
	return arr;
}
