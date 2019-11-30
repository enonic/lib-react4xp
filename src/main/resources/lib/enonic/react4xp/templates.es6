/** NEEDS PARENT PROJECT TO NPM-INSTALL react4xp-templates v0.1.8 OR ABOVE! **/

const React4xp = require('./index');
const ioLib = require('/lib/xp/io');
var portal = require('/lib/xp/portal');

export default {};

/**
 * Render a (possibly Region-containing) page or layout template from a JSX file. Intended for templates with Regions,
 * since those (currently) require server-side rendering. This function ensures that.
 *
 * The argument is a mandatory params object that's entirely passed to the JSX entry (chosen by jsxPath) as props, except jsxPath
 * itself. Its attributes are:
 *
 * @param jsxPath (optional object): points to a JSX entry to use as rendering template. If omitted, renderLayoutBody
 *      first tries to look for a same-name JSX file in the same folder as the layout. If that's not found, falls back to using
 *      react4xp-templates/Layout (https://github.com/enonic/react4xp-templates/blob/master/src/_entries/react4xp-templates/Layout.jsx).
 * @param component (optional object): component data (e.g. from portal.getComponent()).
 *      Has a .regions attribute, which is an object where keys are region names and values are region data (e.g. component.regions),
 *      and a .descriptor string attribute.
 *      If omitted, an internal getComponent() call will be done anyway.
 * @param content (optional object): fallback content data (e.g. from portal.getContent()).
 *      Pages will not have component data, so in order to use this to render a page, the content object is used instead.
 *      Has a .page.regions attribute, which is an object where keys are region names and values are region data (e.g. component.regions),
 *      and a .page.descriptor string attribute.
 *      If omitted, an internal getContent() call will be done anyway.
 * @param regionClasses (optional boolean, string or object): HTML class for the region elements, added after "xp-region".
 *      If boolean, and it's true: adds a class that is the same as the name
 *      If string, all regions get that class.
 *      If object: keys are region names and values are a class name string for each region.
 *      Default if omitted: boolean true
 *
 *      See react4xp-templates/Layout.jsx for its additional props.
 */
export const renderRegionBody = ({jsxPath, component, content, regionClasses, ...props}) => {
    if (!component || typeof component !== 'object') {
        component = portal.getComponent();
    }
    if (!component || typeof component !== 'object') {
        if (!content || typeof content !== 'object') {
            content = portal.getContent();
        }

        if (content && content.page && content.page.descriptor && content.page.type === 'page') {
            component = content.page;
        } else {
            throw Error("lib-react4xp#templates: Can't renderRegionBody without a component object, but component = " + JSON.stringify(component) + ". I even tried falling back to a content object in case this was called from a page controller, but then content.page would need to have a .descriptor field and a .type='page'. But content=" + JSON.stringify(content));
        }
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
