var myJavaLib = require('/lib/example/java-lib');
var testing = require('/lib/xp/testing');

exports.testSetParams = function () {
    var result = myJavaLib.createObject('Lib starter test', ['foo', 42, true], {'test': 123, 'abc': false});

    var expected = {
        "text": "Lib starter test",
        "arrayValues": [
            "foo",
            42,
            true
        ],
        "objectValues": {
            "test": 123,
            "abc": false
        }
    };

    testing.assertJsonEquals(expected, result);
};
