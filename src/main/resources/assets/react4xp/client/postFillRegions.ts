import type {Props} from './index.d';


import {postFillBody} from './postFillBody';


export const postFillRegions = (
	props :Props,
	isDevMode :number //boolean // 0 means false
) => {
	// If hasRegions, render iterates regions and their components, makes a call to lib-react4xp-service react4xp-component
	// for each, looks for body and pageContributions. If body exists, replaces the corresponding tag with body. Runs pageContributions.
	const regionsBuffer = {};
	const regionsRemaining = {};

	Object.keys(props.regionsData || {}).forEach((regionName) => {
		const components = props.regionsData[regionName].components || [];

		// TODO: check for length !== 1
		const region = document.querySelectorAll(
			`[data-portal-region='${regionName}']`
		)[0];
		if (!region) {
			console.error(
				`Expected region name attribute not found in document: data-portal-region="${regionName}"`
			);
			return;
		}

		regionsBuffer[regionName] = region.innerHTML;
		regionsRemaining[regionName] = components.length;

		// Used in dev mode for constructing the inserted postfill console warning (see webpack.config.js):
		const regionPathsPostfilled = []; // eslint-disable-line

		components.forEach((component) => {
			if (
				!component ||
				typeof component !== "object" ||
				Array.isArray(component) ||
				!Object.keys(component).length
			) {
				throw new Error(
					`React4xp couldn't postfill component. Components array has an item that is empty or a non-object: ${JSON.stringify(
						components
					)}`
				);
			} // if

			const [app, compName] = `${component.descriptor || ""}`.split(":");
			if (!app || !compName) {
				throw new Error(
					"Missing or malformed descriptor - React4xp expected a .descriptor attribute like '<enonicXpAppName>:" +
					`<componentName>, and therefore couldn't properly client-side-render this component: ${JSON.stringify(component)}`
				);
			} // if

			if (!component.path) {
				throw new Error(
					`Missing component.path, React4xp couldn't postfill component: ${JSON.stringify(
						component
					)}`
				);
			} // if

			// Append the component path to the current url, without url params:
			let urlCore = window.location.href.split("?")[0];
			if (!urlCore.endsWith("/")) {
				urlCore += "/";
			}
			const url = `${urlCore}_/component${component.path}`;

			fetch(url, {
				method: "GET"
			})
			.then((data) => data.text())
			.then((text) => {
				regionsRemaining[regionName] -= 1;
				postFillBody(
					component.path,
					text,
					region,
					regionName,
					regionsBuffer,
					regionsRemaining
				);
				// postFillPageContributions(json);

				// "React4xp postfilled <n> component(s). This is an attempted fallback, compensating for when React4xp is client-side-
				// rendering an XP page/layout that contains regions. In this case, the components in the regions need to be filled in
				// by the server in a second rendering step. NOTE: Currently, this extra step will only get the HTML of the component.
				// If the component has pageContributions, these will be omitted. Recommended: avoid using React4xp client-side-
				// rendering for a region container (i.e. page/layout) where the region(s) has component(s) that need pageContributions
				// to work. Component path(s): <component path array>`"
				if (isDevMode) {
					regionPathsPostfilled.push(component.path);
					if (!regionsRemaining[regionName] && regionPathsPostfilled.length) {
						console.warn(`React4xp postfilled ${regionPathsPostfilled.length} component(s) because a region-containing
React4xp entry was client-side rendered from an XP controller. Path(s):
${JSON.stringify(regionPathsPostfilled.join(", "))}.

NOTE: This version of React4xp and/or XP don\'t support XP components that need
page contributions inside client-rendered Regions. This includes React4xp
entries in parts, etc. For now, avoid using React4xp client-side-rendering for
entries with Regions, or avoid inserting XP components that need page
contributions to work into those Regions.

See: https://github.com/enonic/lib-react4xp/issues/38`
						); // console.warn
					}
				} // if DEV_MODE
			})
			.catch((error) => {
				console.error(error);
			});
		}); // forEach component
	}); // forEach regionName
}; // postFillRegions
