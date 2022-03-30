import type {PageContributions} from '../../../../index.d';


export function appendCssToHeadEnd(
	url :string,
	pageContributions :PageContributions
) {
  pageContributions.headEnd = [
    ...(pageContributions.headEnd || []),
    `<link href="${url}" rel="stylesheet" type="text/css" />\n`
  ];
};
