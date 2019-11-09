const React4xp = require('/lib/enonic/react4xp');
import { forceArray } from '/lib/util/data';


export const renderPage = (content, params = {}) => {
    let {props = {}, jsxPath, regions} = params;

    if (!content || typeof content !== 'object' || !content.page || typeof content.page !== 'object') {
        throw Error("Can't renderPage without a content.page object, but content = " + JSON.stringify(content));
    }

    jsxPath = ((jsxPath || "") + "").trim();
    let page = null;

    try {
        // If jsxPath param is supplied, use that.
        if (jsxPath === "") {
            page = new React4xp(jsxPath);

        // If not, double fallback: see if regions param is supplied (array of region names)
        // and use the native jsx template populated with those regions.
        } else if (typeof regions === 'string' || Array.isArray(regions)) {
            page = new React4xp('_templates_/Page');
            props = {
                ...props,
                regions: forceArray(regions)
            };

        // If neither of those, try building with page-name template: /site/pages/[pageName]/[pageName]
        } else {
            const pageName = content.page.descriptor.split(':')[1];   // [appName]:[pageName]
            page = new React4xp(`/site/pages/${pageName}/${pageName}`);
        }

    } catch (e) {
        log.error(e);
        throw Error("Couldn't build page template from JSX: " + jsxPath);
    }

    if (Object.keys(props).length > 0) {
        page.setProps({...props, ...content});
    }

    return page.renderEntryToHtml(); // SSR always! Is it possible to use JSX that needs client-rendering in this?
};

export default {};
