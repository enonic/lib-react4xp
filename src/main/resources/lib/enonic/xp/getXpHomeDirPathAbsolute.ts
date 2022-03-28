const System = Java.type('java.lang.System') as unknown as { getProperty:(s :string) => string };
const XP_HOME = System.getProperty('xp.home');


export function getXpHomeDirPathAbsolute() {
	return XP_HOME;
}
