import {cleanAnyDoubleQuoteWrap} from 'JS_UTILS_ALIAS/string/cleanAnyDoubleQuoteWrap';
//import {toStr} from 'JS_UTILS_ALIAS/value/toStr';
import {eTagGetter} from './eTagGetter';


export function getETag(assetPath :string) {
	const response = eTagGetter({
		rawPath: assetPath
	});
	const {
		headers: {
			ETag // Starts and ends with double quotes
		}
	} = response;
	//log.debug('buildAssetUrl() ETag:%s', toStr(ETag));
	return cleanAnyDoubleQuoteWrap(ETag);
}
