import SSRreact4xp from '/lib/enonic/react4xp/ssr/SSRreact4xp';


export function render(
	entryName: string,
	props: string, // JSONstring object
	dependencyNames: string[]
) {
	// log.debug('render entryName:%s', entryName);
	// log.debug('render props:%s', toStr(props));
	// log.debug('render dependencyNames:%s', toStr(dependencyNames));
	return SSRreact4xp.render(
		entryName,
		props,
		dependencyNames
	);
}
