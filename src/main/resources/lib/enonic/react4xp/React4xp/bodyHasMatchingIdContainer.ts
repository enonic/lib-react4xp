export function bodyHasMatchingIdContainer(
	body :string,
	react4xpId :string
) {
    const react4xpPattern = new RegExp("<[^>]+\\s+id\\s*=\\s*[\"']" + react4xpId + "[\"']", 'i');

    return !!body.match(react4xpPattern);
}
