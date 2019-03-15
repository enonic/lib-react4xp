//var lib = require('./dependencies');
var assert = require('/lib/xp/testing');

exports.testDependencies = function() {
    log.info("Yay, something works!");
    assert.assertNotNull(1, 'http.request stream body null');
};
