//import {toStr} from '@enonic/js-utils/value/toStr';


const SSRreact4xp = __.newBean('com.enonic.lib.react4xp.ssr.ServerSideRenderer');


export function render(
	entryName :string,
	props :string, // JSONstring object
	dependencyNames :string // JSONstring array
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


export function setup({
		appName,
		chunkfilesHome,
		chunksExternalsJsonFilename,
		entriesJsonFilename,
		lazyload,
		libraryName,
		scriptEngineSettings,
		scriptsHome,
		ssrMaxThreads,
		statsComponentsFilename,
		userAddedNashornpolyfillsFilename = null
} :{
	appName :string,
	chunkfilesHome :string,
	chunksExternalsJsonFilename :string,
	entriesJsonFilename :string,
	lazyload :boolean,
	libraryName :string,
	scriptEngineSettings :Array<string>,
	scriptsHome :string,
	ssrMaxThreads :number, // Integer
	statsComponentsFilename :string,
	userAddedNashornpolyfillsFilename :null|string
}) {
	//log.debug('setup appName:%s', toStr(appName));
	//log.debug('setup chunkfilesHome:%s', toStr(chunkfilesHome));
	//log.debug('setup chunksExternalsJsonFilename:%s', toStr(chunksExternalsJsonFilename));
	//log.debug('setup entriesJsonFilename:%s', toStr(entriesJsonFilename));
	//log.debug('setup lazyload:%s', toStr(lazyload));
	//log.debug('setup libraryName:%s', toStr(libraryName));
	//log.debug('setup scriptsHome:%s', toStr(scriptsHome));
	//log.debug('setup scriptEngineSettings:%s', toStr(scriptEngineSettings));
	//log.debug('setup ssrMaxThreads:%s', toStr(ssrMaxThreads));
	//log.debug('setup statsComponentsFilename:%s', toStr(statsComponentsFilename));
	//log.debug('setup userAddedNashornpolyfillsFilename:%s', toStr(userAddedNashornpolyfillsFilename));
	//@ts-ignore
	return SSRreact4xp.setup(
		appName,
		scriptsHome,
		libraryName,
		chunkfilesHome,
		userAddedNashornpolyfillsFilename,
		entriesJsonFilename,
		chunksExternalsJsonFilename,
		statsComponentsFilename,
		lazyload,
		ssrMaxThreads,
		scriptEngineSettings
	);
}
