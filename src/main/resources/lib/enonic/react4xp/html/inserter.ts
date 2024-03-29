const HTMLinserter = __.newBean('com.enonic.lib.react4xp.html.HtmlInserter');


export function insertAtEndOfRoot(
	body :string,
	payload :string
) :string {
	//@ts-ignore
	return HTMLinserter.insertAtEndOfRoot(body, payload);
}


export function insertInsideContainer(
	body :string,
	payload :string,
	id :string,
	appendErrorContainer :boolean
) :string {
	//@ts-ignore
	return HTMLinserter.insertInsideContainer(
		body,
		payload,
		id,
		appendErrorContainer
	);
}
