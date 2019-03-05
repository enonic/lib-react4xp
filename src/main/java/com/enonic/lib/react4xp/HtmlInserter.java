package com.enonic.lib.react4xp;

import org.jdom2.Document;
import org.jdom2.Element;
import org.jdom2.JDOMException;
import org.jdom2.filter.Filters;
import org.jdom2.input.SAXBuilder;
import org.jdom2.output.XMLOutputter;
import org.jdom2.xpath.XPathExpression;
import org.jdom2.xpath.XPathFactory;

import javax.xml.xpath.XPathException;
import java.io.IOException;
import java.io.StringReader;
import java.util.List;


public class HtmlInserter {
    private static SAXBuilder saxBuilder = new SAXBuilder();
    private static XMLOutputter outputter = new XMLOutputter();
    static {
        // Make the output HTML-compliant:
        outputter.getFormat()
                .setOmitDeclaration(true)
                .setOmitEncoding(true)
                .setExpandEmptyElements(true);
    }


    public String insertAtEndOfRoot(String body, String payload) {
        try {
            Document bodyDoc = saxBuilder.build(new StringReader(body));
            Element bodyRoot = bodyDoc.getRootElement();

            Document payloadDoc = saxBuilder.build(new StringReader(payload));
            Element payloadRoot = payloadDoc.getRootElement();

            payloadRoot.detach();
            bodyRoot.addContent(payloadRoot);

            return outputter.outputString(bodyDoc);

        } catch (JDOMException | IOException e) {
            e.printStackTrace();
            System.err.println("\n\n" +
                    "ERROR: [ " + e.getClass().getName() + " ] ...when trying to insert HTML" +
                    (payload.length() < 1000 ?
                            "...\n\n" + payload + "\n\n..." :
                            " ") +
                    "into end of body" +
                    (body.length() < 1000 ?
                            ":\n\n" + body + "\n\n" :
                            "") +
                    "\nReturning the submitted body unchanged.");
        }
        return body;
    }


    public String insertInsideContainer(String body, String payload, String id) {
        try {
            Document bodyDoc = saxBuilder.build(new StringReader(body));

            XPathFactory xFactory = XPathFactory.instance();
            String expression = "//*[@id='" + id + "']";
            XPathExpression<Element> expr = xFactory.compile(expression, Filters.element());

            List<Element> links = expr.evaluate(bodyDoc);
            if (links == null || links.size() < 1) {
                throw new XPathException("ID '" + id + "' not found.");
            }

            Document payloadDoc = saxBuilder.build(new StringReader(payload));
            Element payloadRoot = payloadDoc.getRootElement();

            // Whether or not more than one element with that id was found, insert the first one.
            payloadRoot.detach();
            links.get(0).addContent(payloadRoot);

            return outputter.outputString(bodyDoc);

        } catch (JDOMException | IOException | XPathException e) {
            e.printStackTrace();
            System.err.print("\n\n" +
                    "ERROR: [ " + e.getClass().getName() + " ] ...when trying to insert HTML" +
                    (payload.length() < 1000 ?
                            "...\n\n" + payload + "\n\n..." :
                            " ") +
                    "at element with ID '" + id + "' into body" +
                    (body.length() < 1000 ?
                            ":\n\n" + body + "\n\n" :
                            "") +
                    "\nReturning the submitted body unchanged.");
        }
        return body;
    }
}
