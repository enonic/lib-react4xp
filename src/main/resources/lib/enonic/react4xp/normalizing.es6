const COMMA_PLACEHOLDER = "##U+FE10##";

const singleQuoteCounter = item => (item.match(/'/g) || []).length;
const replaceSurroundingSingleQuotes = item => (item.startsWith("'"))
    ? item.replace(/^'/, "").replace(/'$/, "").trim()
    : item.trim();

const doubleQuoteCounter = item => (item.match(/"/g) || []).length;
const replaceSurroundingDoubleQuotes = item => (item.startsWith('"'))
    ? item.replace(/^"/, "").replace(/"$/, "").trim()
    : item.trim();


const preventUnclosedQuotes = (isInsideQuote) => (item) => {
    isInsideQuote['"'] = false;
    isInsideQuote["'"] = false;
    for (let c = 0; c < item.length; c++) {
        const char = item[c];
        isQuoteSoMaybeFlagAsInside(char, c, '"', "'", isInsideQuote, item) ||
        isQuoteSoMaybeFlagAsInside(char, c, "'", '"', isInsideQuote, item);
    }
    if (isInsideQuote["'"] || isInsideQuote['"']) {
        throw Error("Malformed SSR engine setting item: " + item);
    }
    return item;
};


const isQuoteSoMaybeFlagAsInside = (char, c, targetQuote, otherQuote, isInsideQuote, fullString) => {
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
};


/** Normalize engine settings to string array */
const normalizeSSREngineSettings = (ssrEngineSettingsString, ssrDefaultCacheSize) => {

    // When iterating over strings, flags whether a character is inside a quote or not:
    const isInsideQuote = {
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
        throw Error("Malformed SSR engine settings: " + ssrEngineSettings);
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


// Accepts numerical values (which may or may not be in strings), null or undefined, returns number > 0 or null.
const normalizeSSRMaxThreads = (ssrMaxThreadsSetting) => {
    let ssrMaxThreads;
    try {
        ssrMaxThreads = (typeof ssrMaxThreadsSetting === 'number' || typeof ssrMaxThreadsSetting === 'string')
            ? parseInt(ssrMaxThreadsSetting, 10)
            : 0;
    } catch (e) {
        log.error("Looks like the value of ssrMaxThreads from react4xp.properties (or SSR_MAX_THREADS from react4xp_constants.json) is illegal: " + JSON.stringify(ssrMaxThreadsSetting))
    }

    return (!ssrMaxThreads || isNaN(ssrMaxThreads) || ssrMaxThreads < 1)
        ? 0
        : ssrMaxThreads;
}

module.exports = {
    normalizeSSREngineSettings,
    normalizeSSRMaxThreads
}
