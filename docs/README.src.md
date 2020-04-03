[//]: <> (USE THIS FILE TO EDIT THE ROOT's README.md! This will be copied to root and and verions inserted before commit. Gradle task: copyReadme. Version placeholders: ###LIB_VERSION### and ###NPM_BUNDLE_VERSION###. Leave this line in place)

# lib-react4xp


**React for XP: handling and rendering of pre-built React components in Enonic XP**

This library runs on [Enonic XP](https://enonic.com/developer-tour) server side, and provides:

  - services that serve (autodetected and) pre-compiled React components and their dependency scripts to the browser, from a specific file structure. These services also provide headers for caching components and dependencies in the browser.
  - library of XP controller functions, that make it easy to blend React into XP components, in a variety of ways
  - server-side rendering option in XP, through the controller functions  
  - client-side wrapper tailored for use with the services - itself available to the browser through one of the services. 

## Table of Contents
- [Versions and compatibility](#versions-and-compatibility)
- [Setup, option 1: The React4xp starter](#setup-option-1-the-react4xp-starter)
- [Setup, option 2: Using React4xp in an existing project](#setup-option-2-using-react4xp-in-an-existing-project)
  - [0: Prerequisites](#0-prerequisites)
  - [1: Add lib-react4xp](#1-add-lib-react4xp)
  - [2: NPM: import packages](#2-npm-import-packages)
  - [3: Configuration: react4xp.properties](#3-configuration-react4xpproperties)
  - [4: Gradle: basic setup](#4-gradle-basic-setup)
  - [5: Gradle: XP component transpilation (optional)](#5-gradle-xp-component-transpilation-optional)
  - [6: Build and run it all](#6-build-and-run-it-all)

<a name="versions-and-compatibility"></a>
## Versions and compatibility
This is beta version **###LIB_VERSION###**.
    
XP7 compatible. For XP6, see the [XP6_master branch](https://github.com/enonic/lib-react4xp/tree/XP6_master)

This lib-react4xp is installed as a regular XP library in a parent app/project. But it needs to run alongside the NPM packages listed in the table below. Other combinations of versions may work, YMMV, but these are the version combinations of each NPM package that each lib-react4xp package is built for so far. Note that as of lib version 0.8.2, a single NPM package is used instead: the react4xp packages includes a stable combination of the other packages. So these are the recommended combinations:

| **lib-react4xp** | react4xp | react4xp-runtime-client | react4xp-runtime-nashornpolyfills | react4xp-build-components | react4xp-runtime-externals | react4xp-buildconstants | react4xp-regions |
| ------------ | ------------ | ------------ | ------------ | ------------ | ------------ | ------------ | ------------ |
| **0.2.7** | - | - | 0.3.6 | 0.3.8 | 0.3.5 | 0.7.6 |  - |
| **0.2.8** | - | - | 0.3.6 | 0.3.10 | 0.3.5 | 0.7.9 |  - |
| **0.3.7** | - | - | 0.3.6 | 0.3.8 | 0.3.5 | 0.7.6 |  - |
| **0.3.8** | - | - | 0.3.6 | 0.3.10 | 0.3.5 | 0.7.9 |  - |
| **0.3.11** | - | - | 0.3.6 | 0.3.11 | 0.3.5 | 0.7.10 |  - |
| **0.5.0** | - | - | 0.3.6 | 0.5.0 | 0.3.5 | 0.8.0 |  - |
| **0.7.1** | - | 0.4.0 | 0.4.2 | 0.7.0 | 0.4.0 | 0.8.0 |  0.2.0 |
| **0.8.0** | - | 0.5.0 | 0.4.3 | 0.7.3 | 0.4.0 | 0.8.0 |  0.2.1 |
| **0.8.1** | 0.0.5 | - | - | - | - | - | - |
| **###LIB_VERSION###** | ###NPM_BUNDLE_VERSION### | - | - | - | - | - | - |






## Setup, option 1: The React4xp starter

If you're starting with a fresh React4xp project and Enonic XP 7.x, by far the easiest way is to follow [the instructions in the React4xp tutorial](https://developer.enonic.com/templates/react4xp), and build it from there. The starter always uses the latest stable version of this library.

The React4xp starter is also [available at enonic market](https://market.enonic.com/vendors/enonic/react4xp-starter) or as [open source at github](https://github.com/enonic/starter-react4xp).




## Setup, option 2: Using React4xp in an existing project

If you want to skip the starter and inject React4xp in your own XP 7 project, you can. Follow these steps to get all the moving parts up and running:



### 0: Prerequisites
Assuming you have Enonic XP 7.x nicely installed, and you have an **XP parent project** app set up for it (a project where you want to use React4xp).



### 1: Add lib-react4xp

Two ways to add this library to a parent project: import it from an online repository, or build it from scratch:

#### Import it from a repository
Insert into `build.gradle` in the parent project, under `dependencies`:
```groovy
dependencies {
	include 'com.enonic.lib:lib-react4xp:###LIB_VERSION###'
}
```

#### ...or fork and build it yourself
If you need / want to build the lib yourself instead of downloading it with Gradle, add these steps: 

**A.** Clone or otherwise download [the source code for this lib](https://github.com/enonic/lib-react4xp.git) into _its own root folder_ (not into XP_INSTALL or the parent project folder).

**B.** Make the version unique in the library's `gradle.properties`, for example:

```properties
version = ###LIB_VERSION###-SNAPSHOT
```

**C.** Build it with gradle:

```bash
gradlew publishToMavenLocal
```

Gradle will build the library and install it into the local cache, available for other projects.


**D.** Finally, go to the parent project folder root.  Make sure that the version you downloaded/built matches your local reference in `build.gradle`, under `dependencies`, e.g.:

```groovy
dependencies {
    include 'com.enonic.lib:lib-react4xp:###LIB_VERSION###-SNAPSHOT'
}
```

Other handy gradle dev tasks are `clean` and `build`.

---



### 2: NPM: import packages
Go to the _parent XP project folder_ and use the command line to add these NPM packages as _devDependencies_:

```bash
npm add --save-dev react4xp@###NPM_BUNDLE_VERSION###
```

Note: `react4xp@###NPM_BUNDLE_VERSION###` corresponds with lib-react4xp version ###LIB_VERSION###. For other versions of this lib, see [the table of corresponding versions](#versions-and-compatibility) above.

Other development tools might be needed, depending on your setup:

```bash
npm add --save-dev @babel/cli@7 @babel/core@7 @babel/preset-env@7 @babel/preset-react@7 @babel/register@7 webpack@4 webpack-cli@3
```

Etc.



### 3: Configuration: react4xp.properties

A few configuration properties are needed to guide the build steps. Make a file `react4xp.properties` in the root of your project, and copy this into it. Feel free to adjust the values later, to your liking:
```properties
 # ENTRIES AND CHUNKING:
 # If nothing is added below, this is the default behaviour:
 #   - Default entry source folder is /site/, that is: src/main/resources/site/ and its subfolders.
 #   - Everything under react4xp root folder (src/main/resources/react4xp/) will be considered chunks and will
 #       be bundled by webpack into a single dependency imported by webpack: react4xp.<contenthash>.js
 #   - Everything under the react4xp root folder (src/main/resources/react4xp/) will be considered non-entries:
 #       added files here can be imported by react4xp entries, but otherwise unreachable from react4xp.
 #   - Default entryExtensions (file extensions to look for when finding entries under OTHER entryDirs than /site/) are:
 #       jsx, js, tsx, ts, es6, es


 # chunkDirs are folder names where importable, non-entry code is kept. Comma-separated list of folder names, relative
 #       to src/main/resources/react4xp/. Each folder added here will be bundled by webpack into a separate dependency
 #       chunk with the same name as the folder, and a hash: <foldername>.<contenthash>.js. This is good for grouping
 #       sets of dependencies that belong together, or will frequently be requested from the client together in some parts
 #       of a web page but not others, etc. The react4xp root (src/main/resources/react4xp/) is the standard chunk 'react4xp',
 #       but you can add subfolders here to bundle them (and their subfolders) in separate chunks. Or you can add relative
 #       paths to the react4xp root to imported dependency code from elsewhere. Don't overlap with entryDirs or /site/.
chunkDirs = shared


 # entryDirs are additional folder names where webpack will look for entry files. Comma-separated list of folder names,
 #       relative to src/main/resources/react4xp/. By default, react4xp instructs webpack to look for entries under
 #       src/main/resources/site/ (and in the react4xp-templates package). Added folders here will be kept out of bundled
 #       dependency chunks (take care to avoid directory overlaps with chunkDirs) and treated separately. Files in
 #       them will be compiled into react4xp entries, which most importantly get a jsxPath (relative to their entryDir, not
 #       relative to /react4xp/) and therefore are available to react4xp.
 #       overrideComponentWebpack file (see above).
entryDirs = entries


 # entryExtensions are filename extensions of files (comma-separated list) below the entryDirs folders that webpack should
 #       look for and turn into entries. NOTE that this doesn't apply to the default entry-folder src/main/resources/site/
 #       (or the react4xp-templates package), where ONLY .jsx (and .tsx) files can be entries. This is to avoid mixups with
 #       XP controllers etc, which can be .js or .es6. Default value if not changed is jsx,js,tsx,ts,es6,es. Also note that
 #       tsx/ts files are NOT supported out of the box. Rules for typescript compilation must be added in your own
 # entryExtensions =



 # A minimal webpack config is included with react4xp, to build your react components and their dependencies: See node_modules/react4xp-build-components/webpack.config.js.
 # To change this setup, or override or extend that webpack.configjs:
 # make a custom file that default-exports EITHER a finished webpack-style config object, OR a function.
 # The function should take an "env" and "config" argument:
 #   - Env is the collection of "--env." CLI arguments, and
 #   - Config is the default config from react4xp-build-components/webpack.config.js.
 # Manipulate or replace the config object AND return it.
 # Example file:
 #             module.exports = function(env, config) {
 #                 config.module.rules[0].test = /\.((tsx?)|(jsx?)|(es6))$/:
 #                 return config;
 #             };
 # Finally, refer to that file here (path/filename relative to this project's root):
 #
 # overrideComponentWebpack = webpack.config.react4xp.js



 # To add your own custom nashorn polyfills to the already-existing ones:
 # make the a polyfilling file and refer to it here (path/filename relative to this project's root):
 #
 # nashornPolyfillsSource = src/main/resources/extraNashornPolyfills.es6





 # Activates dependencies like react, react-dom, declared in the EXTERNALS config constant - see the react4xp-runtime-externals docs.
buildExternals = true

 # File name for the built master config. Note that the runtime needs a copy of it in this location AND in the folder of the react4xp lib (a location predicted by the constants defined in the master config file itself). This is magically handled by the react4xp-buildconstants script package.
 # masterConfigFileName = build/react4xp_constants.json
overwriteConstantsFile = true
```



### 4: Gradle: basic setup
For now, you need to copy some code into the existing `build.gradle` file in your project (yes, this should obviously be simplified as a gradle plugin):  
  
```groovy
import groovy.json.JsonOutput
import groovy.json.JsonSlurper

// Resolves the project folder root
def ROOT = project.projectDir.toString()

def react4xp = {}
file("react4xp.properties").withReader { reader ->
    react4xp = new Properties()
    react4xp.load(reader)
}

if(react4xp.nashornPolyfillsSource != null) {
    react4xp.NASHORNPOLYFILLS_SOURCE = react4xp.nashornPolyfillsSource
}
if(react4xp.buildEnv != null) {
    react4xp.BUILD_ENV = react4xp.buildEnv
}




// These are not supplied from react4xp, but are just names used for buildtime housekeeping:
def markerName = "node_modules/react4xp/npmInstalled.marker"
def linkMarkerName = "node_modules/react4xp/npmLinked.marker"

task nsiInstall(type:NodeTask) {
    doFirst {
        println "react4xp.properties#buildEnv is set to '" + react4xp.buildEnv + "':\nOVERRIDING VANILLA npmInstall IN FAVOR OF node-safe-install (nsi)." // Because nsi retains 'npm link' symlinks!
    }
    script = file("node_modules/npm-safe-install/out/cli.js")   // npm-safe-install comes with react4xp@^###NPM_BUNDLE_VERSION###
    doLast {
        def marker = new File(linkMarkerName)
        new File(marker.getParent()).mkdirs()
        marker.text = """
Marker file, indicating that react4xp in node_module is locally linked.
"""
    }
}
nsiInstall.inputs.files('package.json', 'package-lock.json')
nsiInstall.outputs.file('package-lock.json')
nsiInstall.outputs.file file(linkMarkerName)

if (new File(linkMarkerName).exists()) {
    npmInstall.enabled = false
    npmInstall.dependsOn nsiInstall

} else {
    npmInstall.enabled = true
    npmInstall.inputs.files('package.json', 'package-lock.json')
    npmInstall.outputs.file('package-lock.json')
    npmInstall.outputs.file file(markerName)
    npmInstall.doLast {
        def marker = new File(markerName)
        new File(marker.getParent()).mkdirs()
        marker.text = """
Marker file, indicating that the npmInstall gradle task has been run in this subproject - faster than traversing the entire node_modules tree for changes.
"""
    }
}


react4xp.masterConfigFileName = react4xp.masterConfigFileName != null ? react4xp.masterConfigFileName : "build/react4xp_constants.json"
react4xp.outputFileName = ROOT + '/' + react4xp.masterConfigFileName

react4xp.verbose = react4xp.verbose != null && react4xp.verbose.toBoolean()
react4xp.buildRuntimeClient = react4xp.buildRuntimeClient != null && react4xp.buildRuntimeClient.toBoolean()
react4xp.buildExternals = react4xp.buildExternals != null && react4xp.buildExternals.toBoolean()
react4xp.overwriteConstantsFile = react4xp.overwriteConstantsFile != null && react4xp.overwriteConstantsFile.toBoolean()


// Build the master config JSON file and the copy:
task config_react4xp(type: NodeTask) {
    group 'React4xp'
    description 'Build the master config JSON file and its copy'

    script = file('node_modules/react4xp-buildconstants/bin/cli.js')       // react4xp-buildconstants comes with react4xp@^###NPM_BUNDLE_VERSION###
    args = [ ROOT, JsonOutput.toJson(JsonOutput.toJson(react4xp)) ]
}
config_react4xp.inputs.file("react4xp.properties")
config_react4xp.outputs.file(react4xp.masterConfigFileName)

config_react4xp.dependsOn += 'npmInstall'
config_react4xp.dependsOn += 'processResources'


// Necessary placeholder, will be filled during build
def CONFIG = {}

task config_tasks {
    // After the above script has run and created the config file, use the constructed values from the script to update the configuration of the next task(s):
    doLast {
        // Read the file content into an object
        def configFile = new File(react4xp.masterConfigFileName)
        def REACT4XP_TASKS = [
                "react4xp_components",
                "react4xp_externals",
                "react4xp_client",
                "react4xp_nashornpolyfills"
        ]
        CONFIG = new JsonSlurper().parseText(configFile.text)

        REACT4XP_TASKS.each {
            // TODO: use react4xp.properites (entryDirs, chunkDirs) instead of assuming these inputs !!!
            tasks["${it}"].configure {
                inputs.dir(CONFIG.SRC_SITE)
                inputs.dir(CONFIG.SRC_R4X)
                outputs.dir(CONFIG.BUILD_R4X)
            }
        }

    }
}
config_tasks.dependsOn += 'config_react4xp'



// Compile:
task react4xp_components(type: NodeTask) {
    group 'React4xp'
    description 'Compile the react components into entry and chunk assets'

    // react4xp-build-components compiles the components added in this project into runnable/renderable components. See react4xp-build-components docs.
    script = file('node_modules/webpack/bin/webpack.js')
    args = [
            '--config', 'node_modules/react4xp-build-components/webpack.config.js', // react4xp-build-components comes with react4xp@^###NPM_BUNDLE_VERSION###
            '--color',
            '--env.VERBOSE=' + react4xp.verbose,
            '--env.ENTRY_DIRS=' + react4xp.entryDirs,
            '--env.CHUNK_DIRS=' + react4xp.chunkDirs,
            '--env.ROOT="' + ROOT +'"'
    ]
    if (react4xp.overrideComponentWebpack != null) {
        args += '--env.OVERRIDE_COMPONENT_WEBPACK=' + react4xp.overrideComponentWebpack
    }

    // Pretty if chatty
    if (react4xp.verbose) {
        args += '--progress'
    }

    // Finally, and mandatorily: tells all of the webpack steps here where to find the react4xp master config file that was built during the config_react4xp task
    args += '--env.REACT4XP_CONFIG_FILE=' + react4xp.masterConfigFileName

    if (react4xp.verbose) {
        println "react4xp_components task - args:"
        println "\t${args}\n"
    }

    inputs.file(react4xp.outputFileName)
    inputs.file("package.json")
    inputs.file("package-lock.json")
}
react4xp_components.dependsOn += 'config_tasks'
jar.dependsOn += "react4xp_components"


task react4xp_externals(type: NodeTask) {
    group 'React4xp'
    description 'Compile the externals asset (react and react-dom)'

    script = file('node_modules/webpack/bin/webpack.js')
    args = [
            '--config', 'node_modules/react4xp-runtime-externals/webpack.config.js',  // react4xp-runtime-externals comes with react4xp@^###NPM_BUNDLE_VERSION###
            '--color',
            '--env.VERBOSE=' + react4xp.verbose,
            '--env.ENTRY_DIRS=' + react4xp.entryDirs,
            '--env.CHUNK_DIRS=' + react4xp.chunkDirs,
            '--env.ROOT="' + ROOT +'"'
    ]

    // Pretty if chatty
    if (react4xp.verbose) {
        args += '--progress'
    }

    // Finally, and mandatorily: tells all of the webpack steps here where to find the react4xp master config file that was built during the config_react4xp task
    args += '--env.REACT4XP_CONFIG_FILE=' + react4xp.masterConfigFileName

    if (react4xp.verbose && react4xp.buildExternals) {
        println "react4xp_externals task - args:"
        println "\t${args}\n"
    }

    inputs.file(react4xp.outputFileName)
    inputs.file("package.json")
    inputs.file("package-lock.json")
}
react4xp_externals.dependsOn += 'config_tasks'
if (react4xp.buildExternals) {
    jar.dependsOn += 'react4xp_externals'
}
```



### 5: Gradle: XP component transpilation (optional)

If you want, or already have, Babel (etc) transpilation for your XP controllers and other assets, this needs to be done separately from the build tasks above! **Make sure that the XP compilation step does not compile your react component source files!** 

Here's an example from the starter; a gradle compile task that leaves `.jsx` files alone:

```groovy
task compileXP(type: NodeTask) {
    group 'React4xp'
    description 'Compile regular (non-React4xp) XP components from ES6, ignoring JSX components'

    script = file('node_modules/@babel/cli/bin/babel.js')
    args = ["src/main/resources", "--out-dir", "build/resources/main", "--ignore", "**/*.jsx"]      // <-- Ignoring JSX in the XP structure

    inputs.dir 'src/main/resources'
    outputs.dir("build/resources/main")
}
compileXP.dependsOn += 'config_tasks'
jar.dependsOn += 'compileXP'
```

(Why is this needed? For simple development after everything's set up, React4xp detects and autocompiles `.jsx` files inside `src/main/resources/site`. This is to encourage a regular-XP-like structure, simply using `.jsx` files as part/page/layout _views_: just keep React entry components in the same folders, with the same names, as the corresponding XP components that use them (this structure is not _enforced_, though - using `entryDirs` and `chunkDirs` in `react4xp.properties` (see below), your react source files can basically be anywhere). However, _the react files are handled differently from other XP components and assets, both at build- and runtime!_ For that reason they must be separated, in this example by using different file extensions: `.jsx` and `.es6`, respectively)






### 6: Build and run it all
Voilà, such easy (I hope)! From the parent project, this can now be run as a regular XP app:
```bash
$ enonic project deploy
```

Or, setting the environment variable `XP_HOME` (e.g. `export XP_HOME=~/.enonic/sandboxes/myProjectSandbox/home`), you can use regular gradle tasks such as `clean`, `build`, `deploy`.


## Happy reacting!

[Move on to the React4xp introduction](https://developer.enonic.com/templates/react4xp)
