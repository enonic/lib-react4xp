/** NEEDS PARENT PROJECT TO NPM-INSTALL react4xp-templates v0.1.8 OR ABOVE! **/

const React4xp = require('./index');
const ioLib = require('/lib/xp/io');

export default {};

/**
 * Render a page template from a JSX file. Intended for page templates with Regions, since those (currently) require server-side
 * rendering. This function ensures that.
 *
 * The argument is a mandatory params object that's entirely passed to the JSX entry (chosen by jsxPath) as props, except jsxPath
 * itself. Its attributes are:
 *
 * @param jsxPath (optional object): points to a JSX entry to use as rendering template. If omitted, renderPageBody
 *      first tries to look for a same-name JSX file in the same folder as the layout. If that's not found, falls back to using
 *      react4xp-templates/Page (https://github.com/enonic/react4xp-templates/blob/master/src/_entries/react4xp-templates/Page.jsx).
 * @param content (mandatory object): data object from an XP layout controller's componennt data (e.g. portal.getConponent()).
 *      Has a .regions attribute, which is an object where keys are region names and values are region data (e.g. component.regions).
 *      See react4xp-templates/Page.jsx for its additional props.
 */
export const renderPageBody = ({content, jsxPath, ...props}) => {

    if (!content || typeof content !== 'object' || !content.page || typeof content.page !== 'object') {
        throw Error("lib-react4xp#templates: Can't renderPageBody without a content.page object, but content = " + JSON.stringify(content));
    }

    jsxPath = ((jsxPath || "") + "").trim();
    let page = null;

    try {
        // If jsxPath param is available, use that.
        if (jsxPath !== "") {
            page = new React4xp(jsxPath);

        // If not, look for a local jsx file (page-name: /site/pages/[pageName]/[pageName]).
        // If that doesn't exist, fall back to the generic Page template in react4xp-templates
        } else {

            const pageName = content.page.descriptor.split(':')[1];   // [appName]:[pageName]
            const jsxPath = `site/pages/${pageName}/${pageName}`;
            const hasLocalJsx = ioLib.getResource(`/${jsxPath}.jsx`).exists();

            page = new React4xp( hasLocalJsx ? jsxPath : 'react4xp-templates/Page');
        }

    } catch (e) {
        log.error(e);
        throw Error("lib-react4xp#templates: Couldn't build page template from JSX. jsxPath=" + JSON.stringify(jsxPath));
    }

    page.setProps({
        content,
        ...(props || {}),
    });

    return page.renderEntryToHtml(); // TODO: SSR always! Is it possible to use JSX that needs client-rendering in this?
};


/**
 * Render a layout template from a JSX file. Intended for layout templates with Regions, since those (currently) require server-side
 * rendering. This function ensures that.
 *
 * The argument is a mandatory params object that's entirely passed to the JSX entry (chosen by jsxPath) as props, except jsxPath
 * itself. Its attributes are:
 *
 * @param jsxPath (optional object): points to a JSX entry to use as rendering template. If omitted, renderLayoutBody
 *      first tries to look for a same-name JSX file in the same folder as the layout. If that's not found, falls back to using
 *      react4xp-templates/Layout (https://github.com/enonic/react4xp-templates/blob/master/src/_entries/react4xp-templates/Layout.jsx).
 * @param component (mandatory object): component data (e.g. from portal.getComponent()).
 *      Has a .regions attribute, which is an object where keys are region names and values are region data (e.g. component.regions)
 * @param regionClasses (optional boolean, string or object): HTML class for the region elements, added after "xp-region".
 *      If boolean, and it's true: adds a class that is the same as the name
 *      If string, all regions get that class.
 *      If object: keys are region names and values are a class name string for each region.
 *      Default if omitted: boolean true
 *
 *      See react4xp-templates/Layout.jsx for its additional props.
 */
export const renderLayoutBody = ({component, jsxPath, regionClasses, ...props}) => {
    if (!component || typeof component !== 'object') {
        throw Error("lib-react4xp#templates: Can't renderLayoutBody without a component object, but component = " + JSON.stringify(component));
    }

    jsxPath = ((jsxPath || "") + "").trim();
    let layout = null;

    try {
        // If jsxPath param is available, use that.
        if (jsxPath !== "") {
            layout = new React4xp(jsxPath);

            // If not, look for a local jsx file (layout-name: /site/layouts/[layoutName]/[layoutName]).
            // If that doesn't exist, fall back to the generic Layout template in react4xp-templates
        } else {
            const layoutName = component.descriptor.split(':')[1];   // FIXME [appName]:[layoutName] ????
            const jsxPath = `site/layouts/${layoutName}/${layoutName}`;
            const hasLocalJsx = ioLib.getResource(`/${jsxPath}.jsx`).exists();

            layout = new React4xp( hasLocalJsx ? jsxPath : 'react4xp-templates/Layout');
        }

    } catch (e) {
        log.error(e);
        throw Error("lib-react4xp#templates: Couldn't build layout template from JSX. jsxPath=" + JSON.stringify(jsxPath));
    }

    layout.setProps({
        component,
        regionClasses: regionClasses || true,
        ...(props || {})
    });

    return layout.renderEntryToHtml(); // TODO: SSR always! Is it possible to use JSX that needs client-rendering in this?
};
