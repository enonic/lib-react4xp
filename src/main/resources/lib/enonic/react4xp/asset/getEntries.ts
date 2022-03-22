import {
	ENTRIES_FILENAME,
	R4X_TARGETSUBDIR
} from '@enonic/react4xp';
import {
	getResource,
	readLines
	//@ts-ignore
} from '/lib/xp/io';


const REACT4XP_ROOT = `/${R4X_TARGETSUBDIR}/`;


export function getEntries() {
	return (JSON.parse(
	    readLines(getResource(REACT4XP_ROOT + ENTRIES_FILENAME).getStream())
	        .join(" ")
	) as Array<string>).map(entry => `${entry}.js`)
}
