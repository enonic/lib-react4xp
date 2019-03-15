var t = require('/lib/xp/testing');

t.mock('/lib/enonic/react4xp/react4xp_constants.json',
    {
        BUILD_R4X: '/react4xp',
        ASSET_URL_ROOT: 'somethingorother'
    }
);

var lib = require('./dependencies');

exports.test_getDependencies_noArgs_should_yieldAllDependencies = function() {
    var result = lib.getDependencies();
    //log.info("Result: " + JSON.stringify(result, null, 2));

    t.assertEquals(3, result.length, "wrong number of dependencies");
    t.assertTrue(result.indexOf("sharedComps.94432343f.js") !== -1, "Expected dependency not found: sharedComps.94432343f.js");
    t.assertTrue(result.indexOf("vendors.8c116bc45.js") !== -1, "Expected dependency not found: vendors.8c116bc45.js");
    t.assertTrue(result.indexOf("redux.b11b36f8c.js") !== -1, "Expected dependency not found: redux.b11b36f8c.js");
};



/*
exports.test_getDependencies_allMathcingArgs_should_yieldAllDependencies = function() {
    t.assertTrue(false, "TODO: Implement me!")
}

exports.test_getDependencies_oneMatchingArgAsArray_should_yieldAllAppropriateDependencies = function() {
    t.assertTrue(false, "TODO: Implement me!")
}

exports.test_getDependencies_oneMatchingArgAsString_should_yieldAllAppropriateDependencies = function() {
    t.assertTrue(false, "TODO: Implement me!")
}

exports.test_getDependencies_oneMatchingArg_shouldNot_yieldInappropriateDependencies = function() {
    t.assertTrue(false, "TODO: Implement me!")
}

exports.test_getDependencies_oneMatchingArg_shouldNot_yieldArgEntryAsItsOwnDependency = function() {
    t.assertTrue(false, "TODO: Implement me!")
}

exports.test_getDependencies_multipleMatchingArg_should_yieldTheUnionOfDependencies = function() {
    t.assertTrue(false, "TODO: Implement me!")
}

exports.test_getDependencies_multipleMatchingArg_shouldNot_yieldAnyEntriesAsTheirOwnDependencies = function() {
    t.assertTrue(false, "TODO: Implement me!")
}

exports.test_getDependencies_multipleMatchingArg_shouldNot_yieldRepeatedDependencies = function() {
    t.assertTrue(false, "TODO: Implement me!")
}

exports.test_getDependencies_oneBadArg_should_fail = function() {
    t.assertTrue(false, "TODO: Implement me!")
}

exports.test_getDependencies_oneBadArgAmongMatchingArgs_should_fail = function() {
    t.assertTrue(false, "TODO: Implement me!")
}

exports.test_getDependencies_multipleArgsWithRedundantEndings_should_stripAwayRedundantsPartsAndStillWork = function() {
    t.assertTrue(false, "TODO: Implement me for slashes, js, jsx")
}
*/

exports.test_getDependencies_multipleNonmatchingArgs_should_failAndIdeallyReportEachProblem = function() {
    try {
        var result = lib.getDependencies(["No good", "Bad bad"]);  
        t.assertTrue(false, "Unexpectedly, got a result instead of an error:\n" + JSON.stringify(result, null, 2));  

    } catch (e) {
        log.info("Error report, as expected:\n" + e.message);  
    }
}
