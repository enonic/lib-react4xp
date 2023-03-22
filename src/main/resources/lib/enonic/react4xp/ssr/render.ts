export const SSRreact4xp = __.newBean<{
	render: (
		entryName: string,
		props: string,
		dependencyNames: string[]
	) => Record<string,string>
	setup: (
		appName: string,
		scriptsHome: string,
		libraryName: string,
		chunkfilesHome: string,
		entriesJsonFilename: string,
		chunksExternalsJsonFilename: string,
		statsComponentsFilename: string,
		lazyload: boolean,
		ssrMaxThreads: number,
		engineName: string,
		scriptEngineSettings: string[]
	) => void
}>('com.enonic.lib.react4xp.ssr.ServerSideRenderer');


export function render(
	entryName: string,
	props: string, // JSONstring object
	dependencyNames: string[]
) {
	//log.debug('render entryName:%s', toStr(entryName));
	//log.debug('render props:%s', toStr(props));
	//log.debug('render dependencyNames:%s', toStr(dependencyNames));
	return SSRreact4xp.render(
		entryName,
		props,
		dependencyNames
	);
}
