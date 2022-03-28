import {isNumber} from '@enonic/js-utils/value/isNumber';
import {isString} from '@enonic/js-utils/value/isString';
import {getAppConfigFilePathAbsolute} from '/lib/enonic/xp/getAppConfigFilePathAbsolute';


// Accepts numerical values (which may or may not be in strings), null or undefined, returns number > 0 or null.
export function normalizeSSRMaxThreads(ssrMaxThreadsSetting :number|string|unknown) :number {
    let ssrMaxThreads :number;
    try {
        ssrMaxThreads = isNumber(ssrMaxThreadsSetting)
			? ssrMaxThreadsSetting
			: isString(ssrMaxThreadsSetting)
            	? parseInt(ssrMaxThreadsSetting, 10)
            	: 0;
    } catch (e) {
        log.error(`Looks like the value of react4xp.ssr.maxThreads from ${
			getAppConfigFilePathAbsolute} is illegal: ${
				JSON.stringify(ssrMaxThreadsSetting)}`)
    }

    return (!ssrMaxThreads || isNaN(ssrMaxThreads) || ssrMaxThreads < 1)
        ? 0
        : ssrMaxThreads;
}
