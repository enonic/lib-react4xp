const SSRreact4xp = __.newBean<{
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
		chunksGlobalsJsonFilename: string,
		statsComponentsFilename: string,
		ssrMaxThreads: number,
		engineName: string
	) => void
}>('com.enonic.lib.react4xp.ssr.ServerSideRenderer');


export default SSRreact4xp;
