/** NEEDS PARENT PROJECT TO NPM-INSTALL react4xp-templates v0.1.8 OR ABOVE! **/

const React4xp = require('./index');
const ioLib = require('/lib/xp/io');

export default {};


export const renderPageBody = (content, params = {}) => {
    let {props = {}, jsxPath} = params;

    if (!content || typeof content !== 'object' || !content.page || typeof content.page !== 'object') {
        throw Error("lib-react4xp#templates: Can't renderPageBody without a content.page object, but content = " + JSON.stringify(content));
    }

    jsxPath = ((jsxPath || "") + "").trim();
    let page = null;

    try {
        // If jsxPath param is supplied, use that.
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

    page.setProps(
        (Object.keys(props).length > 0) ?
            {...props, content} :
            {content}
    );

    return page.renderEntryToHtml(); // SSR always! Is it possible to use JSX that needs client-rendering in this?
};



export const renderLayoutBody = (component, params = {}) => {
    let {props = {}, jsxPath} = params;

    if (!component || typeof component !== 'object') {
        throw Error("lib-react4xp#templates: Can't renderLayoutBody without a component object, but component = " + JSON.stringify(component));
    }

    jsxPath = ((jsxPath || "") + "").trim();
    let layout = null;

    try {
        // If jsxPath param is supplied, use that.
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

    layout.setProps(
        (Object.keys(props).length > 0) ?
            {...props, component} :
            {component}
    );

    return layout.renderEntryToHtml(); // SSR always! Is it possible to use JSX that needs client-rendering in this?
};
