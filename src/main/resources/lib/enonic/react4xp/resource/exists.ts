import {getResource} from './getResource';


export function exists(key :string) :boolean {
	return getResource(key).exists();
}
