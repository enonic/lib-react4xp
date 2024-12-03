import {cleanAnyDoubleQuoteWrap} from '@enonic/js-utils/string/cleanAnyDoubleQuoteWrap';
import lcKeys from '@enonic/js-utils/object/lcKeys';
//import {toStr} from '@enonic/js-utils/value/toStr';
import {eTagGetter} from './eTagGetter';


export function getETag(assetPath :string) {
	const response = eTagGetter({ rawPath: assetPath });
	const { headers } = response;
	const lcHeaders = lcKeys(headers) as typeof headers;
	const {	etag } = lcHeaders; // Starts and ends with double quotes
	//log.debug('buildAssetUrl() ETag:%s', toStr(ETag));
	return cleanAnyDoubleQuoteWrap(etag);
}
