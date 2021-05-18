package com.enonic.lib.react4xp;

import org.jdom2.Document;
import org.jdom2.Element;
import org.jdom2.JDOMException;
import org.jdom2.filter.Filters;
import org.jdom2.input.SAXBuilder;
import org.jdom2.output.XMLOutputter;
import org.jdom2.xpath.XPathExpression;
import org.jdom2.xpath.XPathFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.xml.xpath.XPathException;
import java.io.IOException;
import java.io.StringReader;
import java.util.List;


public class HtmlInserter {
    private final static Logger LOG = LoggerFactory.getLogger( HtmlInserter.class );

    // Make the output HTML-compliant:
    private XMLOutputter getXmlOutputter() {
        XMLOutputter outputter = new XMLOutputter();
        outputter.getFormat()
                .setOmitDeclaration(true)
                .setOmitEncoding(true)
                .setExpandEmptyElements(true);
        return outputter;
    }

    private List<Element> getMatchinIdElements(Document bodyDoc, String id) {
        String expression = "(//*[@id='" + id + "'])[1]";
        XPathFactory xFactory = XPathFactory.instance();
        XPathExpression<Element> expr = xFactory.compile(expression, Filters.element());
        return expr.evaluate(bodyDoc);
    }


    public String insertAtEndOfRoot(String body, String payload) {
        try {
            SAXBuilder saxBuilder = new SAXBuilder();
            Document bodyDoc = saxBuilder.build(new StringReader(body));
            Element bodyRoot = bodyDoc.getRootElement();

            Document payloadDoc = saxBuilder.build(new StringReader(payload));
            Element payloadRoot = payloadDoc.getRootElement();

            payloadRoot.detach();
            bodyRoot.addContent(payloadRoot);

            return getXmlOutputter().outputString(bodyDoc);

        } catch (JDOMException | IOException e) {
            LOG.error("\n\n" +
                    "ERROR: [ " + e.getClass().getName() + " ] ...when trying to insert HTML" +
                    (payload.length() < 1000 ?
                            "...\n\n" + payload + "\n\n..." :
                            " ") +
                    "into end of body" +
                    (body.length() < 1000 ?
                            ":\n\n" + body + "\n\n" :
                            "") +
                    "\nReturning the submitted body unchanged.", e);
        }
        return body;
    }


    public String insertInsideContainer(String body, String payload, String id, boolean appendErrorContainer) {
        try {
            SAXBuilder saxBuilder = new SAXBuilder();
            Document bodyDoc = saxBuilder.build(new StringReader(body));

            List<Element> links = getMatchinIdElements(bodyDoc, id);
            if (links == null || links.size() < 1) {
                throw new XPathException("ID '" + id + "' not found.");
            }

            Element target = links.get(0);

            Document payloadDoc = saxBuilder.build(new StringReader(payload));
            Element payloadRoot = payloadDoc.getRootElement();
            payloadRoot.detach();

            if (appendErrorContainer) {
                                                                                                                        LOG.info("APPENDING ERROR CONTAINER");
                Element existingTarget = target.clone();

                Document emptyDoc = saxBuilder.build(new StringReader(""));
                Element emptyRoot = emptyDoc.getRootElement();
                emptyRoot.detach();

                target.setContent(emptyRoot);
                target.setAttribute("id", id + "__error__");
                target.setAttribute("style", "border:1px solid #8B0000; padding:15px; background-color:#FFB6C1");
                target.addContent(payloadRoot);
                target.addContent(existingTarget);

            } else {
                target.setContent(payloadRoot);
            }

            return getXmlOutputter().outputString(bodyDoc);

        } catch (JDOMException | IOException | XPathException e) {
            LOG.error("\n\n" +
                    "ERROR: [ " + e.getClass().getName() + " ] ...when trying to " + (appendErrorContainer ? "append error message" : "insert") + " HTML" +
                    (payload.length() < 1000 ?
                            "...\n\n" + payload + "\n\n..." :
                            " ") +
                    "at element with ID '" + id + "' into body" +
                    (body.length() < 1000 ?
                            ":\n\n" + body + "\n\n" :
                            "") +
                    "\nReturning the submitted body unchanged.", e);
        }
        return body;
    }
}
