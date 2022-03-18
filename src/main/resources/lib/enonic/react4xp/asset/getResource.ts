import type {Resource} from '../../../..';


//@ts-ignore
import {getResource as javaGetResource} from '/lib/xp/io';


export function getResource(key :string) :Resource {
	return javaGetResource(key);
}
