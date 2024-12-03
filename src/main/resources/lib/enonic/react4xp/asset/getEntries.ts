import {
	ENTRIES_FILENAME,
	R4X_TARGETSUBDIR
} from '@enonic/react4xp/constants.runtime';
import {readResourceLines} from '/lib/enonic/react4xp/resource/readResourceLines';


const REACT4XP_ROOT = `/${R4X_TARGETSUBDIR}/`;


export function getEntries() {
	return (JSON.parse(
	    readResourceLines(REACT4XP_ROOT + ENTRIES_FILENAME)
	        .join(" ")
	) as Array<string>).map(entry => `${entry}.js`)
}
