[//]: <> (lib-react4xp readme:   DO NOT EDIT! Autogenerated and auto-replaced from source docs/README.src.md, write docs there instead!  )

# lib-react4xp

<img src="media/react4xp.svg" alt="React4xp logo" title="React4xp logo" width="160px">

**React for XP: handling and rendering of pre-built React components in Enonic XP**

This library runs on [Enonic XP](https://enonic.com/developer-tour) server side, and provides:

  - services that serve (autodetected and) pre-compiled React components and their dependency scripts to the browser, from a specific file structure. These services also provide headers for caching components and dependencies in the browser.
  - library of XP controller functions, that make it easy to blend React into XP components, in a variety of ways
  - server-side rendering option in XP, through the controller functions  
  - client-side wrapper tailored for use with the services - itself available to the browser through one of the services. 

## Table of Contents
- [Versions and compatibility](#versions-and-compatibility)
- [Setup, option 1: The React4xp starter](#setup-with-react4xp-starter)
- [Setup, option 2: Using React4xp in an existing project](#setup-in-existing-project)
  - [0: Prerequisites](#prerequisites)
  - [1: Add lib-react4xp](#add-lib-react4xp)
  - [2: NPM: install packages](#npm-install)
  - [3: Configuration: react4xp.properties](#react4xp-properties)
  - [4: Gradle build setup](#gradle-build)
  - [5: Gradle: XP component transpilation (optional)](#transpile-components)
  - [6: Build and run it all](#build-and-run)
- [Development](#development)
  - [Local build](#local-build)
  - [NPM-linked mode](#npm-linked-mode)
  - [Install the lib](#install-lib)
- [Usage](#lib-usage)

<br/>

<a name="versions-and-compatibility"></a>
## Versions and compatibility
This is version **1.7.0** for XP 7.

This library, lib-react4xp, is installed as a regular XP library in a parent app/project. It also needs to run alongside a suite of *NPM packages*. These are bundled (by dependency) in the [react4xp package](https://www.npmjs.com/package/react4xp), so by installing that one, you get the necessary packages. 

*This package is needed both in this library and in the parent project* that uses the library - and preferrably with _matching package version_ in both places. The library versions correspond with particular package versions. Whenever a library upgrade requires a new package version, whis table will be updated: 

| **lib-react4xp** | react4xp package (in both lib and app) |
| ------------ | ------------ |
| 1.0.1 | 1.0.0 |
| 1.1.0 | 1.1.3 |
| 1.1.1 | 1.1.4 |
| 1.4.0 | 1.4.0 |
| 1.5.0 | 1.5.4 |
| 1.6.0 | 1.5.7 |
| **1.7.0** | 1.7.0 |




<br/>

<a name="setup-with-react4xp-starter"></a>
## Setup, option 1: The React4xp starter

If you're starting with a fresh React4xp project and Enonic XP 7.x, by far the easiest way is to follow [the instructions in the React4xp tutorial](https://developer.enonic.com/templates/react4xp), and build it from there. The starter always uses the latest stable version of this library.

The React4xp starter is also [available at enonic market](https://market.enonic.com/vendors/enonic/react4xp-starter) or as [open source at github](https://github.com/enonic/starter-react4xp).



<br/>

<a name="setup-in-existing-project"></a>
## Setup, option 2: Using React4xp in an existing project

If you want to skip the starter and inject React4xp in your own XP 7 project, you can. Follow these steps to get all the moving parts up and running:


<a name="prerequisites"></a>
### 0: Prerequisites
Assuming you have Enonic XP 7.x nicely installed, and you have an **XP parent project** app set up for it (a project where you want to use React4xp).


<a name="add-lib-react4xp"></a>
### 1: Add lib-react4xp

Two ways to add this library to a parent project: import it from an online repository, or build it from scratch:

<a name="import-from-lib"></a>
#### 1.1: Import it from a repository...
Insert into `build.gradle` in the parent project, under `dependencies`:
```groovy
dependencies {
	include 'com.enonic.lib:lib-react4xp:1.7.0'
}

repositories {
    maven {
        url 'http://repo.enonic.com/public'
    }
}
```

<a name="fork-and-build"></a>
#### 1.2: ...OR fork and build it yourself
If you need / want to build the lib yourself instead of downloading it with Gradle, add these steps: 

**1.2.1.** Clone or otherwise download [the source code for this lib](https://github.com/enonic/lib-react4xp.git) into _its own root folder_ (not into XP_INSTALL or the parent project folder).

**1.2.2.** Make the version unique in the library's `gradle.properties`, for example:

```properties
version = 1.7.0-SNAPSHOT
```

**1.2.3.** Build it with gradle:

```commandline
gradlew publishToMavenLocal
```

Gradle will build the library and install it into the local cache, available for other projects.


**1.2.4.** Finally, go to the parent project folder root.  Make sure that the version you downloaded/built matches your local reference in `build.gradle`, under `dependencies`, e.g.:

```groovy
dependencies {
    include 'com.enonic.lib:lib-react4xp:1.7.0-SNAPSHOT'
    
    // Depending on your setup, it's likely you also need this,
    // to enable the JSON handling in react4xp.gradle:
    compile group: 'org.json', name: 'json', version: '20210307'
}
```

Other handy gradle dev tasks are `clean` and `build`.

---


<a name="npm-install"></a>
### 2: Install NPM packages
Go to the _parent XP project folder_ and use the command line to add these NPM packages as _devDependencies_:

```commandline
npm install --save-dev react4xp@1.7.0
```

Again, if you're using a different version of this library than 1.7.0, the NPM package may need a different, matching version than `react4xp@1.7.0`. See [above](#versions-and-compatibility).

Other development tools might be needed, depending on your setup:

```commandline
npm add --save-dev @babel/cli@7 @babel/core@7 @babel/preset-env@7 @babel/preset-react@7 @babel/register@7 webpack@4 webpack-cli@3
```

Etc.


<a name="react4xp-properties"></a>
### 3: Configuration: react4xp.properties

A few configuration properties are needed to guide the build steps.

When you've installed the NPM package **react4xp@1.4.0** or higher, you'll find the general config file [react4xp.properties](https://github.com/enonic/react4xp-npm/blob/master/packages/react4xp/src/react4xp.properties) at _node_modules/react4xp/react4xp.properties_. It has usage instructions and explanations in it for configuring your react4xp project by changing values and commenting in/out the different settings to your liking.

**Copy it to your project folder** at the root! Now it's activated, and it will be used by _node_modules/react4xp/react4xp.gradle_ (again, depends on react4xp@1.4.0 or higher) to build your project. If you use your own build.gradle setup instead, just look there for reference.



<a name="gradle-build"></a>
### 4: Gradle build setup
As of version 1.1.0 of [the react4xp NPM package](https://www.npmjs.com/package/react4xp), the react4xp gradle build setup is shared in `react4xp.gradle` in the `react4xp` package. 

As long as that's installed and `npm i` (or similar) has been run before the gradle build, you can simply add this to your `build.gradle`: 

```groovy
apply from: "node_modules/react4xp/react4xp.gradle"
```

If that for some reason is not an option for you, or you want a modified version of the setup, you can [find react4xp.gradle here](https://github.com/enonic/react4xp-npm/blob/master/packages/react4xp/src/react4xp.gradle) and build that into your project.


<a name="transpile-components"></a>
### 5: Gradle: XP component transpilation (optional)

If you want, or already have, Babel (etc) transpilation for your XP controllers and other assets, this needs to be done separately from the build tasks above! **Make sure that the XP compilation step does not compile your react component source files!** 

Here's an example from the starter; a gradle compile task that **leaves `.jsx` files alone**:

```groovy
task compileXP(type: NodeTask) {
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





<a name="build-and-run"></a>
### 6: Build and run it all
Voilà, such easy (I hope)! From the parent project, this can now be run as a regular XP app:
```commandline
enonic project deploy
```

Or, setting the environment variable `XP_HOME` (e.g. `export XP_HOME=~/.enonic/sandboxes/myProjectSandbox/home`), you can use regular gradle tasks such as `clean`, `build`, `deploy`.


<br/>

<a name="development"></a>
## Development

Getting started with working on this library locally.

<a name="local-build"></a>
### Local build

Run this first to get set up.

```commandline
gradlew build
```

<a name="npm-linked-mode"></a>
### NPM-linked mode

This lib (and consuming react4xp apps) requires the corresponding [react4xp NPM packages](https://www.npmjs.com/package/react4xp). If you want to work with this lib with _local versions_ of those packages too, it's convenient to symlink them up under `node_modules`: 

1. Download/fork/clone [react4xp-npm](https://github.com/enonic/react4xp-npm) from github to a separate source folder,

2. From that root react4xp-npm folder:
    ```commandline
    gradlew npmLink
    ```  
 
3. Back in the root folder of _this lib_, run react4xp-npm's `getLinks` script (sorry, this script has no windows version yet, but should be fairly easy to reverse-engineer): 
    ```commandline
    sh relative/path/to/local/react4xp-npm/getlinks.sh
    ``` 
4. Install the lib locally (see the next heading below),

5. From the root folder of your react4xp app project too, run `getLinks` with a relative path (same way as in step 3 above),

6. Build the react4xp app.

<a name="install-lib"></a>
### Install the lib

To install the built library in local maven cache, available for building react4xp app(s) locally, follow [the instructions above](#fork-and-build).

<a name="lib-usage"></a>
## Usage

Best explained in the [React4xp introduction guide](https://developer.enonic.com/templates/react4xp). 

<br/>

**Happy reacting!**
