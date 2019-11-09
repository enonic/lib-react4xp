import React from 'react';
import Region from '../../_templates_/Region';

export default ({
    regions,
    content,
    title,
    regionTag
    // TODO: More custom head tags through props?
                }) =>
    [
        '<!DOCTYPE html>',
        <html>
            <head>
                { title ?
                    <title>{title}</title> :
                    null
                }
            </head>

            <body className="xp-page">
                {
                    regions ?
                        regions.map(region => <Region {...{content}} name={region} tag={regionTag} />) :
                        null
                }
            </body>
        </html>
    ];
