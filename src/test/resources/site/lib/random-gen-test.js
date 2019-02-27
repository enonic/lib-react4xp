var myJavaLib = require('/lib/example/java-lib');
var testing = require('/lib/xp/testing');

exports.testRandomBoolean = function () {
    var result = myJavaLib.randomBoolean();

    testing.assertEquals(typeof result, 'boolean', 'Invalid result: ' + result);
};

exports.testRandomInteger = function () {
    var result = myJavaLib.randomInteger(0, 42);

    testing.assertTrue(result < 42 && result >= 0, 'Invalid result: ' + result);
};

exports.testRandomNumber = function () {
    var result = myJavaLib.randomNumber(1.0, 9.8);

    testing.assertTrue(result < 9.8 && result >= 1.0, 'Invalid result: ' + result);
};

exports.testRandomString = function () {
    var result = myJavaLib.randomString(10);

    testing.assertTrue(typeof result === 'string' && result.length === 10, 'Invalid result: ' + result);
};
