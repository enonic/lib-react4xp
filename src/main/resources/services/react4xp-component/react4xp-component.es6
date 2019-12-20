/** Service that always delivers the out-of-the-box frontend client */
exports.get = (req) => {
    log.info("req.params (" +
    	(Array.isArray(req.params) ?
    		("array[" + req.params.length + "]") :
    		(typeof req.params + (req.params && typeof req.params === 'object' ? (" with keys: " + JSON.stringify(Object.keys(req.params))) : ""))
    	) + "): " + JSON.stringify(req.params, null, 2)
    );
    return {
        contentType: 'applocation/json',
        body: JSON.stringify({
            body: `<div>${req.params.compName} (${req.params.type}): ${req.params.config}</div>`,
            pageContributions: {
                bodyBegin: '<script>console.log("bodyBegin");</script>',
                bodyEnd: '<script>console.log("bodyEnd");</script>',
                headBegin: '<script>console.log("headBegin");</script>',
                headEnd: '<script>console.log("headEnd");</script>',
            }
        }),
    }
};
