import type {Stream} from '../../../..';


import {getResource} from './getResource';


export function getResourceStream(key :string) :Stream {
	return getResource(key).getStream();
}
