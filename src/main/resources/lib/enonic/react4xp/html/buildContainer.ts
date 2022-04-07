import {element} from '/lib/enonic/react4xp/html/element';


export function buildContainer({
	id,
	content = ''
} :{
	id :string
	content? :string
}) {
	return element({
		attributes: {
			id
		},
		content
	});
}
