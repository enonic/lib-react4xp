import {ENTRIES_FILENAME} from '@enonic/react4xp';
//@ts-ignore
import {R4X_TARGETSUBDIR} from '/lib/enonic/react4xp/react4xp_constants.json';
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
