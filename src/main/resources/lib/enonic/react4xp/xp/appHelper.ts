const helper = __.newBean<{
	isDevMode: () => boolean
	getXpHome: () => string
}>('com.enonic.lib.react4xp.AppHelper');
export const IS_DEV_MODE = helper.isDevMode();
export const IS_PROD_MODE = !IS_DEV_MODE;

const XP_HOME = helper.getXpHome();

export function getXpHomeDirPathAbsolute() {
	return XP_HOME;
}
