document.addEventListener('DOMContentLoaded', function(/*event*/) {
	const inlineJsonElements = Array.from(document.querySelectorAll('script[data-react4xp-ref][type="application/json"]'));
	for (let index = 0; index < inlineJsonElements.length; index++) {
		const inlineJsonElement = inlineJsonElements[index];
		if (inlineJsonElement instanceof HTMLElement) {
			const id = inlineJsonElement.dataset.react4xpRef;
			//console.debug('id', id);

			const json = inlineJsonElement.textContent;
			//console.debug('json', json);

			let data = {};
			try {
				data = JSON.parse(json);
			} catch (e) {
				console.error('Something went wrong while trying to JSON.parse(' + json + ')');
			}
			//console.debug('data', data);

			const {
				command,
				devMode,
				hasRegions,
				isPage,
				jsxPath,
				props
			} = data as {
				command :'hydrate'|'render'
				devMode :'1'|'0'|1|0|boolean
				hasRegions :'1'|'0'|1|0|boolean
				isPage :'1'|'0'|1|0|boolean
				jsxPath :string
				props :object
			};
			/*console.debug('command', command);
			console.debug('devMode', devMode);
			console.debug('hasRegions', hasRegions);
			console.debug('isPage', isPage);
			console.debug('jsxPath', jsxPath);
			console.debug('props', props);*/
			React4xp.CLIENT[command](
				React4xp[jsxPath], id, props, isPage, hasRegions, devMode
			);
		}
	} // for
});
