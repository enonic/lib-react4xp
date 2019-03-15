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

    t.assertEquals(3, result.length, "wrong number of dependencies");
    t.assertTrue(result.indexOf("sharedComps.94432343f.js") !== -1, "Expected dependency not found: sharedComps.94432343f.js");
    t.assertTrue(result.indexOf("vendors.8c116bc45.js") !== -1, "Expected dependency not found: vendors.8c116bc45.js");
    t.assertTrue(result.indexOf("redux.b11b36f8c.js") !== -1, "Expected dependency not found: redux.b11b36f8c.js");
};


exports.test_getDependencies_allMathcingArgs_should_yieldAllDependencies = function() {
    var result = lib.getDependencies(["SimpleGreeter", "Greeter", "site/parts/clientReduxed/clientReduxed", "site/parts/example/example"]);
    
    t.assertEquals(3, result.length, "wrong number of dependencies");
    t.assertTrue(result.indexOf("sharedComps.94432343f.js") !== -1, "Expected dependency not found: sharedComps.94432343f.js");
    t.assertTrue(result.indexOf("vendors.8c116bc45.js") !== -1, "Expected dependency not found: vendors.8c116bc45.js");
    t.assertTrue(result.indexOf("redux.b11b36f8c.js") !== -1, "Expected dependency not found: redux.b11b36f8c.js");
}


/** Appropriate dependencies are: not the entry itself and not the .map files, but all the other dependencies for the entry, and only once. */
exports.test_getDependencies_oneMatchingArgAsArray_should_yieldAppropriateDependencies = function() {
    var resultSimpleGreeter = lib.getDependencies(["SimpleGreeter"]);
    t.assertEquals(0, resultSimpleGreeter.length, "wrong number of dependencies for SimpleGreeter");
    
    var resultGreeter = lib.getDependencies(["Greeter"]);
    t.assertEquals(1, resultGreeter.length, "wrong number of dependencies for Greeter");
    t.assertTrue(resultGreeter.indexOf("vendors.8c116bc45.js") !== -1, "Expected dependency for Greeter not found: vendors.8c116bc45.js");
        
    var resultClientReduxed = lib.getDependencies(["site/parts/clientReduxed/clientReduxed"]);
    t.assertEquals(2, resultClientReduxed.length, "wrong number of dependencies for site/parts/clientReduxed/clientReduxed");
    t.assertTrue(resultClientReduxed.indexOf("sharedComps.94432343f.js") !== -1, "Expected dependency for site/parts/clientReduxed/clientReduxed not found: sharedComps.94432343f.js");
    t.assertTrue(resultClientReduxed.indexOf("redux.b11b36f8c.js") !== -1, "Expected dependency for site/parts/clientReduxed/clientReduxed not found: redux.b11b36f8c.js");

    var resultClientExample = lib.getDependencies(["site/parts/example/example"]);
    t.assertEquals(1, resultClientExample.length, "wrong number of dependencies for site/parts/example/example");
    t.assertTrue(resultClientExample.indexOf("redux.b11b36f8c.js") !== -1, "Expected dependency for site/parts/example/example not found: redux.b11b36f8c.js");
}


/** Appropriate dependencies are: not the entry itself and not the .map files, but all the other dependencies for the entry, and only once. */
exports.test_getDependencies_oneMatchingArgAsString_should_yieldAppropriateDependencies = function() {
    var resultSimpleGreeter = lib.getDependencies("SimpleGreeter");
    t.assertEquals(0, resultSimpleGreeter.length, "wrong number of dependencies for SimpleGreeter");
    
    var resultGreeter = lib.getDependencies("Greeter");
    t.assertEquals(1, resultGreeter.length, "wrong number of dependencies for Greeter");
    t.assertTrue(resultGreeter.indexOf("vendors.8c116bc45.js") !== -1, "Expected dependency for Greeter not found: vendors.8c116bc45.js");
        
    var resultClientReduxed = lib.getDependencies("site/parts/clientReduxed/clientReduxed");
    t.assertEquals(2, resultClientReduxed.length, "wrong number of dependencies for site/parts/clientReduxed/clientReduxed");
    t.assertTrue(resultClientReduxed.indexOf("sharedComps.94432343f.js") !== -1, "Expected dependency for site/parts/clientReduxed/clientReduxed not found: sharedComps.94432343f.js");
    t.assertTrue(resultClientReduxed.indexOf("redux.b11b36f8c.js") !== -1, "Expected dependency for site/parts/clientReduxed/clientReduxed not found: redux.b11b36f8c.js");

    var resultClientExample = lib.getDependencies("site/parts/example/example");
    t.assertEquals(1, resultClientExample.length, "wrong number of dependencies for site/parts/example/example");
    t.assertTrue(resultClientExample.indexOf("redux.b11b36f8c.js") !== -1, "Expected dependency for site/parts/example/example not found: redux.b11b36f8c.js");
}


/** Appropriate dependencies are: not the entries themselves and not the .map files, but the union set of all the other dependencies for the entries combined into one array, and each dependency only once. */
exports.test_getDependencies_multipleMatchingArg_should_yieldTheUnionOfDependencies = function() {
    // One of them is empty (no deps)
    var resultGreeters = lib.getDependencies(["Greeter", "SimpleGreeter"]);
    t.assertEquals(1, resultGreeters.length, "wrong number of dependencies for Greeter+SimpleGreeter");
    t.assertTrue(resultGreeters.indexOf("vendors.8c116bc45.js") !== -1, "Expected dependency for Greeter+SimpleGreeter not found: vendors.8c116bc45.js");
    
    // Non-overlapping deps lists
    var resultGreeterRedux = lib.getDependencies(["Greeter", "site/parts/clientReduxed/clientReduxed"]);
    t.assertEquals(3, resultGreeterRedux.length, "wrong number of dependencies for Greeter+site/parts/clientReduxed/clientReduxed");
    t.assertTrue(resultGreeterRedux.indexOf("vendors.8c116bc45.js") !== -1, "Expected dependency for Greeter+site/parts/clientReduxed/clientReduxed not found: vendors.8c116bc45.js");
    t.assertTrue(resultGreeterRedux.indexOf("sharedComps.94432343f.js") !== -1, "Expected dependency for Greeter+site/parts/clientReduxed/clientReduxed not found: sharedComps.94432343f.js");
    t.assertTrue(resultGreeterRedux.indexOf("redux.b11b36f8c.js") !== -1, "Expected dependency for Greeter+site/parts/clientReduxed/clientReduxed not found: redux.b11b36f8c.js");
    
    // Overlapping deps lists
    var resultExampleRedux = lib.getDependencies(["site/parts/example/example", "site/parts/clientReduxed/clientReduxed"]);
    t.assertEquals(2, resultExampleRedux.length, "wrong number of dependencies for site/parts/example/example+site/parts/clientReduxed/clientReduxed");
    t.assertTrue(resultExampleRedux.indexOf("sharedComps.94432343f.js") !== -1, "Expected dependency for site/parts/example/example+site/parts/clientReduxed/clientReduxed not found: sharedComps.94432343f.js");
    t.assertTrue(resultExampleRedux.indexOf("redux.b11b36f8c.js") !== -1, "Expected dependency for site/parts/example/example+site/parts/clientReduxed/clientReduxed not found: redux.b11b36f8c.js");
}


/** Tolerance: stripping away slash, .js or .jsx at the end of arguments  */
exports.test_getDependencies_redundantEndings_should_stripAwayRedundantsPartsAndStillWork = function() {
    var resultGreeter = lib.getDependencies("Greeter.js");
    t.assertEquals(1, resultGreeter.length, "wrong number of dependencies for Greeter.js");
    t.assertTrue(resultGreeter.indexOf("vendors.8c116bc45.js") !== -1, "Expected dependency for Greeter.js not found: vendors.8c116bc45.js");
    
    var resultReduxed = lib.getDependencies("site/parts/clientReduxed/clientReduxed.jsx");
    t.assertEquals(2, resultReduxed.length, "wrong number of dependencies for clientReduxed.jsx");
    t.assertTrue(resultReduxed.indexOf("sharedComps.94432343f.js") !== -1, "Expected dependency for clientReduxed.jsx not found: sharedComps.94432343f.js");
    t.assertTrue(resultReduxed.indexOf("redux.b11b36f8c.js") !== -1, "Expected dependency for clientReduxed.jsx not found: redux.b11b36f8c.js");

    var resultExample = lib.getDependencies("site/parts/example/example/");
    t.assertEquals(1, resultExample.length, "wrong number of dependencies for example/");
    t.assertTrue(resultExample.indexOf("redux.b11b36f8c.js") !== -1, "Expected dependency for example/ not found: redux.b11b36f8c.js");

    var resultExample2 = lib.getDependencies("site/parts/example/example///");
    t.assertEquals(1, resultExample2.length, "wrong number of dependencies for example///");
    t.assertTrue(resultExample2.indexOf("redux.b11b36f8c.js") !== -1, "Expected dependency for example/// not found: redux.b11b36f8c.js");
}


exports.test_getDependencies_oneBadArg_should_fail = function() {
    try {
        var result = lib.getDependencies(["A/bad/one"]);  
        t.assertTrue(false, "Unexpectedly, got a result instead of an error:\n" + JSON.stringify(result, null, 2));  

    } catch (e) {
        log.info("Error report, as expected:\n" + e.message);  
    }
}


exports.test_getDependencies_oneBadArgAmongMatchingArgs_should_fail = function() {
    try {
        var result = lib.getDependencies(["Greeter", "Suddenly/bad", "site/parts/clientReduxed/clientReduxed"]);  
        t.assertTrue(false, "Unexpectedly, got a result instead of an error:\n" + JSON.stringify(result, null, 2));  

    } catch (e) {
        log.info("Error report, as expected:\n" + e.message);  
    }
}


exports.test_getDependencies_multipleNonmatchingArgs_should_failAndIdeallyReportEachProblem = function() {
    try {
        var result = lib.getDependencies(["No good", "Bad bad"]);  
        t.assertTrue(false, "Unexpectedly, got a result instead of an error:\n" + JSON.stringify(result, null, 2));  

    } catch (e) {
        log.info("Error report, as expected:\n" + e.message);  
    }
}
