import {getXpHomeDirPathAbsolute} from '/lib/enonic/xp/getXpHomeDirPathAbsolute';


const APP_CONFIG_FILE_PATH_ABSOLUTE = `${getXpHomeDirPathAbsolute()}/config/${app.name}.cfg`;


export function getAppConfigFilePathAbsolute() {
	return APP_CONFIG_FILE_PATH_ABSOLUTE;
}
