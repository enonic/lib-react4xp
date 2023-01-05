export const SSRreact4xp = __.newBean('com.enonic.lib.react4xp.ssr.ServerSideRenderer');


export function render(
	entryName :string,
	props :string, // JSONstring object
	dependencyNames :string[]
) {
	//log.debug('render entryName:%s', toStr(entryName));
	//log.debug('render props:%s', toStr(props));
	//log.debug('render dependencyNames:%s', toStr(dependencyNames));
	//@ts-ignore
	return SSRreact4xp.render(
		entryName,
		props,
		dependencyNames
	);
}
