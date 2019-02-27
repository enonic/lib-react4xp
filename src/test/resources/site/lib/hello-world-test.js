var myLib = require('/lib/example/js-lib');
var testing = require('/lib/xp/testing');

exports.testHello = function () {
    var result = myLib.hello('world');

    testing.assertEquals(result, 'Hello world');
};
