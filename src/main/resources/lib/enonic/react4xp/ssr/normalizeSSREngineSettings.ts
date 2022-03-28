interface InsideQuoteState {
	"'" :boolean
	'"' :boolean
}


const COMMA_PLACEHOLDER = "##U+FE10##";


function singleQuoteCounter(item :string) {
	return (item.match(/'/g) || []).length;
}


function replaceSurroundingSingleQuotes(item :string) {
	return (item.startsWith("'"))
		? item.replace(/^'/, "").replace(/'$/, "").trim()
		: item.trim();
}


function doubleQuoteCounter(item :string) {
	return (item.match(/"/g) || []).length;
}


function replaceSurroundingDoubleQuotes(item :string) {
	return (item.startsWith('"'))
    	? item.replace(/^"/, "").replace(/"$/, "").trim()
    	: item.trim();
}


const preventUnclosedQuotes = (isInsideQuote :InsideQuoteState) => (item :string) => {
    isInsideQuote['"'] = false;
    isInsideQuote["'"] = false;
    for (let c = 0; c < item.length; c++) {
        const char = item[c];
        isQuoteSoMaybeFlagAsInside(char, c, '"', "'", isInsideQuote, item) ||
        isQuoteSoMaybeFlagAsInside(char, c, "'", '"', isInsideQuote, item);
    }
    if (isInsideQuote["'"] || isInsideQuote['"']) {
        throw new Error("Malformed SSR engine setting item: " + item);
    }
    return item;
};


function isQuoteSoMaybeFlagAsInside(
	char :string,
	c :number,
	targetQuote :'"'|"'",
	otherQuote :'"'|"'",
	isInsideQuote :InsideQuoteState,
	fullString :string
) {
    if (char === targetQuote) {
        if (isInsideQuote[targetQuote]) {
            if (c > 0 && fullString[c - 1] !== "\\") {
                isInsideQuote[targetQuote] = false;
            }
        } else if (!isInsideQuote[otherQuote]) {
            isInsideQuote[targetQuote] = true;
        }
        return true;
    }
    return false;
}


/** Normalize engine settings to string array */
export function normalizeSSREngineSettings(
	ssrEngineSettingsString :string|unknown,
	ssrDefaultCacheSize :number = 0
) {

    // When iterating over strings, flags whether a character is inside a quote or not:
    const isInsideQuote :InsideQuoteState = {
        "'": false,
        '"': false
    };


    // 1. ------------ If the entire multi-setting-items-stringis surrounded by a single set of double (or single) quotes, strip that away.

    let ssrEngineSettings = ((ssrEngineSettingsString || ssrDefaultCacheSize) + "").trim();

    if (ssrEngineSettings.endsWith("'") && singleQuoteCounter(ssrEngineSettings) === 2) {
        ssrEngineSettings = replaceSurroundingSingleQuotes(ssrEngineSettings);
    }
    if (ssrEngineSettings.endsWith('"') && doubleQuoteCounter(ssrEngineSettings) === 2) {
        ssrEngineSettings = replaceSurroundingDoubleQuotes(ssrEngineSettings);
    }



    // 2. The settings string should be split into items on commas, but not on commas that are inside per-item quotes (that still remain after previous step).
    //      So replace those commas with a placeholder before splitting, and re-insert them after splitting.
    for (let c = 0; c < ssrEngineSettings.length; c++) {
        const char = ssrEngineSettings[c];
        if (
            !isQuoteSoMaybeFlagAsInside(char, c, '"', "'", isInsideQuote, ssrEngineSettings) &&
            !isQuoteSoMaybeFlagAsInside(char, c, "'", '"', isInsideQuote, ssrEngineSettings) &&
            (char === ',' && (isInsideQuote['"'] || isInsideQuote["'"]))
        ) {
            ssrEngineSettings = ssrEngineSettings.substring(0, c) + COMMA_PLACEHOLDER + ssrEngineSettings.substring(c + 1);
            c += COMMA_PLACEHOLDER.length - 1;
        }
    }
    if (isInsideQuote["'"] || isInsideQuote['"']) {
        throw new Error("Malformed SSR engine settings: " + ssrEngineSettings);
    }


    // 3. Split the setting string into items, filter away empty items, trim away spaces or quotes that surround each item,
    //      and if any of them still has unclosed quotes, throw an error.
    return ssrEngineSettings
        .split(/\s*,\s*/)
        .map(item => ((item || '') + '').trim())
        .filter(item => !!item)
        .map(item => item.replace(COMMA_PLACEHOLDER, ","))
        .map(replaceSurroundingDoubleQuotes)
        .map(replaceSurroundingSingleQuotes)
        .map(preventUnclosedQuotes(isInsideQuote))
};
