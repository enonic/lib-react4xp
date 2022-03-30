import type {PageContributions} from '../../../../index.d';


/** Wraps a url in a script tag and appends it to pageContributions.js.bodyEnd with an async tag. The reason for choosing
 *  bodyEnd is that this allows display of server-side-rendered content or placeholders before starting to load the
 *  acrtive components. The component-render-triggering <script> tag should have a defer attribute in order to wait for
 *  these to load. */
export function appendScriptToBodyEnd(
	url :string,
	pageContributions :PageContributions
) {
  pageContributions.bodyEnd = [
    ...(pageContributions.bodyEnd || []),
    `<script src="${url}"></script>\n`
  ];
};
