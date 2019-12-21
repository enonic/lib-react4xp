/** Service that always delivers the out-of-the-box frontend client */
exports.get = (req) => {
    log.info("req.params (" +
    	(Array.isArray(req.params) ?
    		("array[" + req.params.length + "]") :
    		(typeof req.params + (req.params && typeof req.params === 'object' ? (" with keys: " + JSON.stringify(Object.keys(req.params))) : ""))
    	) + "): " + JSON.stringify(req.params, null, 2)
    );
    return {
        contentType: 'application/json',
        body: JSON.stringify({
            body: `<div>${req.params.compName} (${req.params.type}): ${req.params.config}</div>`,
            pageContributions: {
                bodyBegin: `<script>console.log("bodyBegin: ${req.params.compName} (${req.params.type}):", ${JSON.stringify(req.params.config)});</script><script>console.log("Okay then.");</script>`,
                bodyEnd: `<script>console.log("bodyEnd");</script><div><p>Wow it working</p></div><script>console.log("Okay bodyEnd.");</script>`,
                headBegin: '<script>console.log("headBegin");</script><style>a {color: black;}</style>',
                headEnd: '<style>b {color: red;}</style><script>console.log("headEnd");</script>',
            }
        }),
    }
};
