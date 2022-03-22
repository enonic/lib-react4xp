import {
	FILE_NAME_R4X_RUNTIME_SETTINGS,
	R4X_TARGETSUBDIR
} from '@enonic/react4xp';
import {readResourceAsJson} from '/lib/enonic/react4xp/resources/readResourceAsJson';
import {IS_DEV_MODE} from '/lib/enonic/xp/runMode';


const FILE_PATH_RELATIVE_R4X_RUNTIME_SETTINGS = `/${R4X_TARGETSUBDIR}/${FILE_NAME_R4X_RUNTIME_SETTINGS}`
const RUNTIME_SETTINGS = readResourceAsJson(FILE_PATH_RELATIVE_R4X_RUNTIME_SETTINGS);


export function readRuntimeSettings() {
	if (IS_DEV_MODE) {
		return readResourceAsJson(FILE_PATH_RELATIVE_R4X_RUNTIME_SETTINGS);
	}
	return RUNTIME_SETTINGS;
}
