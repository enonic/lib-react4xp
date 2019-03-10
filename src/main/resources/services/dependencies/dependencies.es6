var { getPageContributions } = require('/lib/enonic/react4xp/pageContributions');


let DEPENDENCIES = null;

exports.get = (req) => {
    if (!DEPENDENCIES) {
        log.info("Init service dependencies");
        const pageContributions = getPageContributions();
        DEPENDENCIES = pageContributions.bodyEnd.map( scriptLine => scriptLine
            .replace(/\n<script src="/g, '')
            .replace(/" ><\/script>/g, '')
        )

        log.info("dependencies: " + JSON.stringify(DEPENDENCIES));
    }

    return {body: JSON.stringify(DEPENDENCIES) };
};
