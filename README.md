# lib-react4xp-runtime

Beta: 0.2.0

**React for XP: handling and rendering of pre-built React components in Enonic XP**

This library runs on [Enonic XP](https://enonic.com/developer-tour) server side, and provides:
  - services that serve pre-compiled React components and their dependency scripts to the browser, from a specific file structure. The package [react4xp-build-components](https://www.npmjs.com/package/react4xp-build-components) builds this structure from React source files. These services also provide headers for caching components and dependencies in the browser.
  - library of XP controller functions, that make it easy to blend React into XP components, in a variety of ways
  - server-side rendering option in XP, through the controller functions  
  - client-side wrapper tailored for use with the services - itself available to the browser through one of the services. 
    

## Jump to:
  - [Install the library](#installing-the-library)
    - [Prerequisites](#prerequisites)
    - [Importing the lib in your parent project](#importing-the-installed-lib-in-the-parent-project)
      - [How to build it yourself](#build-it-yourself)
      
  - [Parent project setup](#setting-up-the-parent-project)
    - [1: NPM packages](#1-npm-import-packages)
    - [2: Gradle: basic setup](#2-gradle-basic-setup)
    - [3: Gradle: XP component transpilation](#3-gradle-xp-component-transpilation-optional)
    - [4: Build and run it all](#4-build-and-run-it-all)
    
  - [Overview](#overview)
    - [Usage: 3 main ways to render](#usage-3-main-ways-to-render)
    - [jsxPath: how to refer to a component](#jsxpath-how-to-refer-to-a-react4xp-component)
    - [Entries and Chunks](#entries-and-dependency-chunks) 
      - [Control your structure](#how-to-control-your-entrychunk-structure)
    
  - [Examples: Hello World in the 3 main ways](#examples-hello-world)
    - [From a Content Studio ready component](#1-content-studio-ready-component)
    - [From an XP controller outside of Content Studio](#2-from-an-xp-controller-outside-of-content-studio)
	- [From the client: standalone HTML page](#3-completely-standalone-html) 

  - [Advanced use](#advanced-use)
    - [Using the library from the controllers](#the-library)
      - [Direct rendering in controllers](#direct-rendering-in-controllers)
      - [Rendering with a React4xp data holder instance](#rendering-with-a-data-holder-react4xp-object)
	- [Using the services from the client](#the-services)
	  - [The asset fetcher: /react4xp](#the-asset-fetcher-react4xp)
	  - [The client wrapper: /react4xp-client](#the-client-wrapper-react4xp-client)
	  - [The Externals provider: /react4xp-externals](#the-externals-provider-react4xp-externals)
	  - [The dependency chunk tracker: /react4xp-dependencies](#the-dependency-chunk-tracker-react4xp-dependencies)
    - [React state: using class components](#react-state-rendering-class-components)
  - [Technical details](#technical-details)
    - [How does this work?](#how-does-this-thing-work)
    - [Nashorn server-side rendering](#nashorn-server-side-rendering)
	- [Independent, component-less entries](#component-less-entries)
	


---

## Installing the library

_This library is a work in progress at the moment_. The install process will be simplified before long, in particular publishing this lib on [Enonic Market](https://market.enonic.com/), and using a Gradle plugin to import it into your XP project. 

If you still want to try it out right now, here's how:

### Prerequisites
Assuming you have Enonic XP nicely installed, and you have an **XP parent project** app set up for it (a project where you want to use React4xp). Look for e.g. a React4xp starter in Enonic Market.

### Importing the installed lib in the parent project 
Insert into `build.gradle` in the parent project, under `dependencies`:
```groovy
dependencies {
	include 'com.enonic.lib:lib_react4xp_runtime:0.2.0'
}
```

#### Build the lib yourself
If you need / want to build the lib yourself instead of downloading it with Gradle, add these steps: 

- Clone or otherwise download [the source code for this lib](https://github.com/enonic/lib-react4xp-runtime.git) into _its own root folder_ (not into XP_INSTALL or the parent project folder). 
- From that folder, run:
```bash
gradlew build install
```
Gradle will build the library and install it into the local cache, available for other projects. Make sure that the version you downloaded/built matches your reference in `build.gradle`, e.g. `0.2.0`.

---

## Setting up the parent project
This is a runtime lib, so it doesn't provide any tools required for building/transpiling your parent project and your React components there. Add these steps in your parent project to get all the moving parts up and running:


### 1: NPM: import packages
Go to the _parent XP project folder_ and use the command line to add these NPM packages as _devDependencies_:

```bash
npm add --save react4xp-buildconstants react4xp-build-components react4xp-runtime-externals babel-cli react-dom
```
 

#### Optional steps

_react4xp-runtime-externals_ is actually optional. Depends on whether or not you use it in `build.gradle` in step 2 below. In this setup it _will_ be used.

Two other NPM packages are mentioned but commented out in step 2. They are already included in this library. **You only need to install them if you're custimizing deeply**:
```bash
npm add -D react4xp-runtime-client react4xp-runtime-nashornpolyfills 
```

#### React4xp package overview:
  - [react4xp-buildconstants](https://www.npmjs.com/package/react4xp-buildconstants) - builds a master config file that defines project constants for the build and runtime
  - [react4xp-build-components](https://www.npmjs.com/package/react4xp-build-components) - transpiles your react components
  - [react4xp-runtime-externals](https://www.npmjs.com/package/react4xp-runtime-externals) - provides external dependencies according to the EXTERNALS project constant: React and ReactDOM out of the box.
  - [react4xp-runtime-client](https://www.npmjs.com/package/react4xp-runtime-client) - the client-side rendering wrapper. Included in this lib.
  - [react4xp-runtime-nashornpolyfills](https://www.npmjs.com/package/react4xp-runtime-nashornpolyfills) - polyfilling the Nashorn engine for running the server-side rendering. Included in this lib.


### 2: Gradle: basic setup
_This should be turned into a simple-to-use gradle plugin before long!_ For now, you need to add these steps to set up two important gradle tasks: 
  - `config_react4xp` sets up a master config file, defining the project structure and React4xp's place in it. This config file is heavily used in both build- and runtime.
  - `webpack_react4xp` builds your parent project's React components and other necessary parts, into pieces that will be run by this library.
  
Add this section or similar to the parent project's `build.gradle`:
  
```groovy
import groovy.json.JsonSlurper

// Config file name for buildtime. Note that the runtime needs a copy of it in the folder of the react4xp lib - a location predicted by the constants defined in the config file itself. This is magically handled by the react4xp-buildconstants script package:
def REACT4XP_CONFIG_FILE = "build/react4xp_constants.json"

// Resolves the project folder root
def ROOT = new File("").absolutePath

// Necessary placeholder, will be filled during build
def CONFIG = {}

// Override config values to taste with a JSON-parseable string. See the react4xp-buildconstants docs:
def REACT4XP_OVERRIDES = '{"outputFileName": "' + ROOT + '/' + REACT4XP_CONFIG_FILE + '"}'

// Build the master config JSON file and the copy:
task config_react4xp(type: NodeTask) {
    script = file('node_modules/react4xp-buildconstants/cli.js')
    args = [ ROOT, REACT4XP_OVERRIDES ]

    // After the above script has run and created the config file, use the constructed values from the script to update the configuration of the next task(s):
    doLast {
        // Read the file content into an object
        def configFile = new File(REACT4XP_CONFIG_FILE)
        CONFIG = new JsonSlurper().parseText(configFile.text)

        tasks['webpack_react4xp'].configure {
            inputs.dir(CONFIG.SRC_SITE)        
            inputs.dir(CONFIG.SRC_R4X)
            outputs.dir(CONFIG.BUILD_R4X)
        }
    }
}
config_react4xp.dependsOn += 'npmInstall'


// Compile:
task webpack_react4xp(type: NodeTask) {
    script = file('node_modules/webpack/bin/webpack.js')
    args = [
        // 1 MANDATORY STEP:
        '--config', 'node_modules/react4xp-build-components/webpack.config.js',			// <-- This step compiles the components added in this project into runnable/renderable components. See react4xp-build-components docs.
        
        // 3 OPTIONAL STEPS:
        //'--config', 'node_modules/react4xp-runtime-client/webpack.config.js',   		// <-- Activate this line to override the included clientside wrapper (included in lib-react4xp-runtime) - see the react4xp-runtime-client docs.
        //'--config', 'node_modules/react4xp-runtime-nashornpolyfills/webpack.config.js',  	// <-- Activate this line to roll your own nashorn polyfill instead of the included one. See react4xp-runtime-nashornpolyfills docs.       
        '--config', 'node_modules/react4xp-runtime-externals/webpack.config.js',  		// <-- This line supplies dependencies declared in the EXTERNALS config constant - see the react4xp-runtime-externals docs. If you remove this line, you can/must add react@16 and react-dom@16 on all your HTML pages yourself - e.g. from a CDN.

        '--env.REACT4XP_CONFIG_FILE=' + ROOT + '/' + REACT4XP_CONFIG_FILE, 			// <-- Tells all of the steps here where to find the master config file
        '--progress', '--color'  								// <-- Just pretty
    ]

    inputs.file(REACT4XP_CONFIG_FILE)
    inputs.file("package.json")
    inputs.file("package-lock.json")
}
webpack_react4xp.dependsOn += 'config_react4xp'

jar.dependsOn += 'webpack_react4xp'
```

### 3: Gradle: XP component transpilation (optional)

If you want Babel (etc) transpilation for your XP controllers, **this needs to be done separately from the build tasks in step 2!** 

(Why? For simple development after everything's set up, React4xp encourages you to keep React entry components in the same folders, with the same names, as the corresponding XP components that use them. But both build- and runtime handles React and XP components very differently. For that reason **they must have different file extensions**: .JSX and .ES6, respectively. Typescript support should be fairly easy to add)

This can be done in the regular XP way, but here's an example gradle task that both aligns xp transpilation with eventual tweaks in the config file, as well as makes sure not to mix up XP and React components:   

```groovy
task babelXP(type: NodeTask) {
    script = file('node_modules/babel-cli/bin/babel.js')
    args = ["src/main/resources", "--out-dir", "build/resources/main", "--ignore", "**/*.jsx"]      // <-- Ignoring JSX in the XP structure is important!

    inputs.dir 'src/main/resources'
    outputs.dir("build/resources/main")
}
babelXP.dependsOn += 'config_react4xp'
babelXP.dependsOn += 'processResources'

jar.dependsOn += 'babelXP'
```

...and add this at the end of the `doLast` block in the `config_react4xp` gradle task:
```groovy
        tasks['babelXP'].configure {
            args = ["src/main/resources", "--out-dir", CONFIG.BUILD_MAIN, "--ignore", "**/*.jsx"]  // <-- Still ignoring JSX in the XP structure
            outputs.dir(CONFIG.BUILD_MAIN)
        }
```

### 4: Build and run it all
And voilà! Such easy! From the parent project, this can now be run as a regular XP app:
```bash
$ cd <project folder>
$ gradlew deploy
$ cd <XP server folder>
$ bin/server
```

    

---

## Overview

Taking a look at the 3 main approaches to rendering with React4xp, as well as two important concepts: the `jsxPath`, and _entries_.

### Usage: 3 main ways to render

There are 3 main ways to use this library with XP:

1. React components **directly inside XP components in Content Studio** (parts and pages for now, although layouts _might_ work). That is, the React component is part of an XP component's view, and handled and referred in the XP component's controller. This approach is made to be easy to use, and lets the controller fetch data in regular XP ways (portalLib's `.getComponent`, `.getContent` etc), and also has methods for server-side rendering and client-side hydration - as well as automatically adding headers for effective client-side caching of the resources. This mode can also automate the HTML side of things if you want - handling the React insertion container by itself, even without a specific HTML view file for the part/page if necessary.

2. React components in web pages that are rendered by XP controllers, but **outside the XP Content Studio flow** - for example when getting a page from an XP webapp or a service. This approach also has access to XP's serverside logic and the React4xp helper methods of this library, but makes a manual reference to the React component (this can also be done in the first component-oriented approach, if needed).

3. **Standalone client-side mode**. In this case, an HTML file loads the react4xp client script from the `/react4xp-client` service. This exposes methods that a browser can call. It can either manually trigger rendering of already-loaded components, or use a method that automates it: just list the React4xp component names, their target container IDs and their props, and let the client call the services in _this_ lib to first find URLs for the dependency resources needed, download and run them, and finally trigger their rendering. This requires this library to provide the services, but otherwise uses the [react4xp-runtime-client package](https://www.npmjs.com/package/react4xp-runtime-client)  (**included in this library, no need for a separate installation**) - look there for docs and examples on the standalone mode.


### jsxPath: how to refer to a React4xp component
**The jsxPath** is React4xp's internal name for each [Entry](#jsxpath-how-to-refer-to-a-react4xp-component) component. When you have the jsxPath, you can use the component from anywhere in a lot of React4xp's methods - including a standalone HTML file.

The name is derived at build time, from the path of the transpiled react component, relative to a particular target folder in the JAR artifact of your app. But make no mistake, _a jsxPath is a name string_, not a path that can be used relatively (i.e. a jsxPath can't contain `..`, `//`, `/./` or start with `/` or `.`).

In short: 

- A JSX source file can be **bound to an XP component**, that is, the source file is inside the folder of an XP component, under `<projectFolder>/src/main/resources/site/<component-type>/<component-name>/`. The jsxPath will then be _the XP-relative path to the JSX file_ (starts with `site/...`), without the file extension. 

- If a JSX file is **independent from XP components**, the source file should be put below a special source folder in order for all the automatics to work: `<projectFolder>/src/main/react4xp/_components/` (*). The jsxPath will then be the path-and-name of the source file relative to that folder (still without file extension) (the path to this magic folder can be adjusted with the React4xp config file)


**So in the examples below**...
 - the XP-component-bound file `<projectFolder>/src/main/resources/site/parts/example/example.jsx`. It will get the jsxPath `"site/parts/example/example"`, 
 - while `<projectFolder>/src/main/react4xp/_components/SimpleGreeter.jsx` is independent and will get the jsxPath `"SimpleGreeter"`. 
 
**PROTIP:** When your app is built by [react4xp-build-components](https://www.npmjs.com/package/react4xp-build-components), it creates an overview file of all the available components and their jsxPaths: see `<projectFolder>/build/main/resources/react4xp/entries.json` (*). You can use this file for lookup, but don't edit or delete it - it's an active part of the runtime.

_(*) The location of these magic folders can be tweaked and adjusted. This is controlled by the master config file built by [react4xp-buildconstants](https://www.npmjs.com/package/react4xp-buildconstants)._


### Entries and dependency chunks
React4xp components can import other components or JS code (and more), and imported stuff like this can be used by more than one React component, as shared components. Even shared code sections can share even deeper levels of code. 

For both cleanliness and performance, it's a good idea to separate out shared components in deeper **chunks** that are loaded separately from the components that use them - and since they are often used in more than one place on a website, the chunks can be cached in the browser ([client-side HTTP caching](https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/http-caching)) for fast access.

**React4xp does this automatically in build time**, using [Webpack code splitting](https://webpack.js.org/guides/code-splitting/) to _layer_ the transpiled output / static assets it produces: 

- On the top level are the **Entry Components**. These are the components that are directly renderable and available to React4xp. These are the only components that have a [jsxPath](#jsxpath-how-to-refer-to-a-react4xp-component). They are not put into chunks, and not cached, and for that reason it's a good idea to keep them as minimal as possible - leave heavy lifting to bigger chunks. React4xp Entry source files must have a `.jsx` file extension (currently - we might add Typescript later). Technically, an Entry will be a react app in itself in runtime - so memory management is likely to be another argument for using heavy chunks and lightweight entries.
 
- One level down are the dependency **Chunks**, the bigger, organized collections of code that's used and import by at least one Entry. Their names are content-hashed for cache-busting. This means their runtime names are unpredictable at buildtime, so React4xp services do some housekeeping to keep track of the produced chunk names as well as which Entries use which Chunks. As long as you use the jsxPaths of the entries and the methods in this lib for fetching the dependencies, you won't need to think about chunks, hashing or caching.

#### How to control your Entry/Chunk structure
_TL;DR: put your code that's shared by React4xp components under `<projectFolder>/src/main/react4xp/<chunk-name>/`._

What code will be transpiled into Chunks? And what will become Entries? This is determined by [react4xp-build-components](https://www.npmjs.com/package/react4xp-build-components), by where you put the source files.

  - **Entries** are built from source files in either `<projectFolder>/src/main/react4xp/_components` (JSX, JS or ES6 file extensions) or `<projectFolder>/src/main/resources/site/<component-type>/<component-name>/` (where `<component-type>` can be `pages` or `parts` at the moment - or `layouts`, but that's experimental for now. Here, only JSX file extensions are allowed). 
  
  - **Chunks** are built and named from any code in the folders `<projectFolder>/src/main/react4xp/<chunk-name>/` - and only code that's imported and used by at least one Entry. Use this to organize your chunks.
  
  - Code that's imported by Entries from _other folders_ than that, will be compiled into the Entry and increase the size of the downloaded, non-cached component!
  
  - Non-Entry code that's not imported will be ignored.

These will all be built and transpiled to regular minified JS assets in `<projectFolder>/build/main/resources/react4xp/`. Also note that these magic folder names can be adjusted - see [react4xp-buildconstants](https://www.npmjs.com/package/react4xp-buildconstants).

---

## Examples: Hello World

The part you've been waiting for, or skipped to if you're impatiently inclined: the simplest-case rendering for the [3 main usage approaches](#usage-3-main-ways-to-render):

### 1. Content Studio-ready Component

[Entry](#entries-and-dependency-chunks) JSX files in XP-component folders can be rendered **very easily** (and if that use case doesn't suit you, there are many ways to tweak this), in a similar way to what you're used to from other XP controllers.

Add a JSX react file to the same folder as an XP part or page. File names matter (if you want it to be as simple as this) - use the same name as the part or page, and a `.jsx` file extension:

```jsx harmony
// site/parts/example/example.jsx:

import React from 'react';

export default (props) => <p>Hello {props.greetee}!</p>;
```

Import the `React4xp` library in the part controller, and let it use the `request` and the part's `component` data - here wrapped in a `params` object along with some React `props`.  

```jsx harmony
// site/parts/example/example.es6:

const portal = require('/lib/xp/portal');
const React4xp = require('/lib/enonic/react4xp');

exports.get = function(request) {
    const params = {
        component: portal.getComponent(),
        props: { greetee: "world"}
    };
    
    return React4xp.render(request, params);
};
```

`React4xp.render` returns a response object ready to be returned directly from the controller: just like in a regular XP controller, it will contain some HTML under `body` (component server-side rendered with the initial props into a container). It will also have some `pageContributions` that makes the browser contact the server and download and run the compiled scripts for the component itself, and its dependencies (notably for hydrating the component on the client side).

That's it. Add the part to a page in XP content studio, and rejoice as the world is greeted!


### 2. From an XP controller outside of Content Studio

Just like in a vanilla React setup, you could just make a regular HTML document that refers by URL to the component and its dependencies, and let XP serve these as simple static assets, as long as they've been compiled previously.

However, React4xp aims to make this easier in use, and deliver some performance gain while we're at it. In this approach (and the next), the browser uses [the jsxPath references](#jsxpath-how-to-refer-to-a-react4xp-component) and lets the client use React4xp's handy services.

The `react4xp` service at the URL `<domain>/_/service/<xp.parent.app.name>/react4xp` serves runnable assets to the browser - both the component itself and its dependencies. So the runnable code for e.g. the `SimpleGreeter` component is available at: `<domain>/_/service/<xp.parent.app.name>/react4xp/SimpleGreeter`. We can also use a single controller function from this library, `dependencies.getAllUrls(jsxPath)`, to check if the component has any dependencies, and get an array of service urls for those, if there are any (`.getAllUrls` accepts a single jsxPath  string or an array. Either way, it will automatically prevent duplicate downloads of shared dependencies).

That's all the client needs. In this case, we use thymeleaf to insert the URLs into an HTML document from a standalone XP controller. 

Actually, let's render _two_ different components into the page - in addition to SimpleGreeter, we'll also use `example.jsx` from the previous example, now with its jsxPath, `"site/parts/example/example"`: 

```jsx harmony
// The controller, main.es6:

const thymeleaf = require('/lib/xp/thymeleaf');
const view = resolve('main.html');

const dependencies = require('/lib/enonic/react4xp/dependencies');

exports.get = req => {

	// We get an array with URLs for the dependencies of the two components we want to render - by jsxPath:
	const urls = dependencies.getAllUrls([
		'SimpleGreeter', 
		'site/parts/example/example'
	]);
    	
	// After the dependencies (order matters! These two components must be loaded AFTER their dependencies so we add them last), 
	// we add the URLs to fetch the component entries' own scripts:
	urls.push(`/_/service/${app.name}/react4xp/SimpleGreeter`);
	urls.push(`/_/service/${app.name}/react4xp/site/parts/example/example`);
	
	const model = { urls };
	return {
		body: thymeleaf.render(view, model)    
	}
};
```

What happens when the browser runs the component and dependency scripts? One of the dependency urls we got from `getAllUrls` from will be the React4xp client wrapper (at `/_/service/<app.name>/react4xp-client`). When this is run, the wrapper is exposed to the browser as `CLIENT` in a global object `React4xp`, with a rendering method: `React4xp.CLIENT.render(component, targetElementId, props)`.

The component scripts are also downloaded and run, and adds the React components to the same `React4xp` object - e.g. as `React4xp.SimpleGreeter`: 

```jsx harmony
// src/main/react4xp/_components/SimpleGreeter.jsx:

import React from 'react';

export default (props) => <p>Hello {props.worldOrWhatever}!</p>;
```



```html
<!-- main.html: -->

<html>
<head>
    <title>Hey world</title>
</head>
<body>
    <div id="simple_target"></div>
    <div id="example_target"></div>

	<!-- The client wrapper and the externals chunk carrying both React and ReactDOM are part of the URLs from getAllUrls. If you want to skip lib-runtime-react4xp's built-in react and react-dom chunk, remove react4xp-runtime-externals from build.gradle in your parent app (or remove them from EXTERNALS in the master config). Then you can use React and ReactDOM from CDN e.g. like this: ->        <script crossorigin src="https://unpkg.com/react@16/umd/react.production.min.js"></script><script crossorigin src="https://unpkg.com/react-dom@16/umd/react-dom.production.min.js"></script>         <!- More docs about EXTERNALS elsewhere in the lib-react4xp-runtime README. -->
        
	<!-- Load all the dependency scripts: -->
    <script data-th-each="url: ${urls}" data-th-src="${url}"></script>

	<!-- Call the rendering of each entry component: -->
    <script defer>
        React4xp.CLIENT.render(React4xp.SimpleGreeter, 'simple_target', {worldOrWhatever: "World"});
        React4xp.CLIENT.render(React4xp['site/parts/example/example'], 'example_target', { greetee: "different world" });
    </script>

    </body>
</html>
```

A note about the `React4xp.CLIENT.render` function and the first argument (the reference to the react component): the component should be passed like this: `React4xp.SimpleGreeter`, or the general form: `React4xp['jsxPathString']`. If we had simply passed the jsxPath as a string (for example just `"SimpleGreeter"`), `render` would interpret that as an attempt to insert a finished-rendered HTML string into the container, and just display: 

```
SimpleGreeter
```
on the page.


### 3. Completely standalone HTML
If you need or want to use React4xp without a controller, the services offer the same functionality clean from HTML. All you need is the URL for the client wrapper as mentioned above, and the [jsxPaths](#jsxpath-how-to-refer-to-a-react4xp-component) for the components you want to render. 

After the browser has run the client, use `React4xp.CLIENT.renderWithDependencies(entries, callback)`, where `entries` is an object where the keys are component jsxPaths and each of the values are: `targetId` (target id to container DOM element) and `props`. The `callback` is an optional function that will be called at the end of the chain of scripts downloaded and run.

In this example, we're fetching two react components

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>React4xp standalone page 2</title>

    <!-- OPTION 1: We could get React and ReactDOM from a CDN like this...
        	<script crossorigin src="https://unpkg.com/react@16/umd/react.production.min.js"></script>
        	<script crossorigin src="https://unpkg.com/react-dom@16/umd/react-dom.production.min.js"></script>
    -->

    <!-- OPTION 2: ...but instead we're using the built-in Externals script from the service. This supplies React and ReactDOM pre-packaged and readily cached. More docs about EXTERNALS elsewhere in the lib-react4xp-runtime README. -->
    <script src="/_/service/<app.name>/react4xp-externals"></script>
    
    <!-- The client wrapper is needed either way: -->
    <script src="/_/service/<app.name>/react4xp-client"></script>

</head>
<body>

    <div id="simple_target"></div>
    <div id="example_target"></div>
    
    <script>

            // Actual rendering:
            React4xp.CLIENT.renderWithDependencies(
                {
                    SimpleGreeter: {
                        targetId: 'simple_target',
                        props: {worldOrWhatever: "whatever"}
                    },

                    'site/parts/example/example': {
                        targetId: 'example_target',
                        props: { greetee: "different world" },
                    },
                },

                // Demo callback:
                function() { console.log("This is inserted and called after rendering the components."); }
            );
    </script>
    </body>
</html>
```


---

## Advanced use

### The library 

`lib/enonic/react4xp/index.es6`

The main functionality, used in XP component controllers (parts, pages and maybe layouts). Aims to make rendering as easy and flexible to use as possible! Handles the interplay between backend and frontend, mainly using the [jsxPaths](#jsxpath-how-to-refer-to-a-react4xp-component) of the [entry components](#entries-and-dependency-chunks).

#### Direct rendering in controllers
Two rendering functions are directly available to XP controllers, with the same signature: 
  - `.render(request, params)`: the basic, best-practice wrapper for rendering. Server-side-renders the react component from its initial props, into a HTML string, and adds the necessary pageContributions that activates (hydrates) the component into a functioning react component on the client side (except in XP Content Studio's **edit mode**: here, an activated react component messes with the Content Studio edit logic, so only the static HTML renderings are displayed. In other words: the component pageContributions are skipped in edit mode). 
  - `.renderSafe(request, params)`: this has two purposes. First, it's the fallback renderer that's used if `.render` runs into problems. Second, it renders without server-side rendering: only delivering a target container element to the client, and pageContributions that make the client mount the React component in the target container (except in edit mode, just like in edit mode for `.render`. Here, the pageContributions are still skipped. But since the pageContributions constitute the entire visualization, React4xp will _try_ to server-side render the component in edit mode in order to have something to show).
  
_Parameters for both functions:_ 

`request` (object, mandatory) is the request object passed into controller methods (used to determine if the component is being rendered in edit mode).

`params` (object, mandatory) configures the React component being rendered. **NOTE:** `params` must include a `component` attribute, **or** if that is missing: the attributes `jsxPath` **and** `id` (or a non-empty, non-falsy `uniqueId`). If `component` is included, it's used to extrapolate `jsxPath` and `id`. All other attributes in `params`are optional.

All `params` attributes are: 
  - `component` (object): XP component object used to extrapolate component part (pointing it to a JSX component in the same folder and with the same file name as the XP component) and target container ID (using the component `_path`). This is enough if the JSX entry file is in the same folder and has the same name, and the react component doesn't need to be rendered into a particular pre-existing HTML container element.
  - `jsxPath` (string): [jsxPath](#jsxpath-how-to-refer-to-a-react4xp-component) to react component entry. Overrides the extrapolated jsxPath if `component` was set.
  - `id` (string): sets the target container element id (overrides the extrapolated id if component was set). If this matches an element ID in the HTML `body` attribute, the react component will be rendered there. If not, a container with this ID will be added at the end of `body`.
  - `uniqueId` (boolean or string): ensures that the ID is unique. Adds a random integer postfix to the end of `id`. If `uniqueId` is a string, this is treated as a prefix before the random postfix. If `uniqueId` is a string _and_ `id` is also set (or extrapolated), `uniqueId` overrides `id`.
  - `props` (object): React props sent in to the component for the initial rendering. Serializable values only.
  - `body` (string): an existing HTML body (e.g. rendered from Thymeleaf), into which the rendered React component will be inserted. If it already contains a matching-`id` target container element, the `body` value won't be changed (apart from the react component being inserted if server-side rendering is used). If however `body` does not have a matching-`id` container, it will be built (as a `<div>` element) and inserted at the end of the `body` string, inside the root element. If `body` is missing, that matching-`id` target container element is built and used as `body` - with the react component inserted into it.
  - `pageContributions` (object) Pre-existing page contributions in [standard XP format](https://xp.readthedocs.io/en/stable/developer/site/contributions.html).
 
Both functions return a full [standard XP-format response object](https://xp.readthedocs.io/en/stable/developer/ssjs/http-response.html) that can be directly returned from an XP controller. If the rendering fails, they will display an error placeholder.

Also worth noting: `.render` and `.renderSafe` always send the `id` (or `uniqueId`) to the component, as `props.react4xpId`.

##### Examples of direct rendering

[Example 1 above](#1-content-studio-ready-component), using only the `params.component` and `params.props` attributes.

A more complex example with an XP controller that renders a React component from a different folder into a particular container, which in turn was pre-rendered with Thymeleaf:

src/main/resources/site/parts/the-part/the-view.html
```html
<div>
	<h1>Header</h1>
	<div data-th-class="${someDynamicClass}" id="myTargetContainer"></div>
	<div>And now for something completely different</div>
</div>
```



src/main/resources/site/parts/other-folder/other-file.jsx:
```jsx harmony
import React from 'react';

export default (props) => <h2>Howdy globe!</h2>;
```



src/main/resources/site/parts/the-part/the-controller.es6:
```jsx harmony
const thymeleaf = require('/lib/xp/thymeleaf');
const React4xp = require('/lib/enonic/react4xp');

exports.get = function(request) {
    const view = resolve('the-view.html');
    const model = {
        someDynamicClass: 'class-for-target-container'
    };
    const body = thymeleaf.render(view, model);
    
    const params = {
        jsxPath: 'site/parts/other-folder/other-file',
        id: 'myTargetContainer',
        body: body
    };
    
    return React4xp.render(request, params);
};
```



#### Rendering with a data-holder React4xp object

The functions above use a temporary data holder object under the hood: a **React4xp instance**. For advanced use and fine-grained control, it's available to use in the component: 

##### Construction

A React4xp instance object can be built with `.buildFromParams(params)`, where `params` is the same as for `.render` and `.renderSafe` ([see above](#direct-rendering-in-controllers)) - except for `body` and `pageContributions`. 

```jsx harmony
const React4xp = require('/lib/enonic/react4xp');

const reactComp = React4xp.buildFromParams({
	jsxPath: 'site/parts/other-folder/other-file',
	id: 'myTargetContainer'
});
```

There's also a handy constructor that autodetects if it's argument is a `component` or `jsxPath` attribute:

```jsx harmony
const portal = require('/lib/xp/portal');

const reactComp2 = new React4xp('site/parts/other-folder/other-file');

const reactComp3 = new React4xp(portal.getComponent());
```

##### Adjustment
After it's been constructed (or built from params), an instance object can be adjusted using a [builder pattern](https://medium.com/@modestofiguereo/design-patterns-2-the-builder-pattern-and-the-telescoping-constructor-anti-pattern-60a33de7522e) with these optional methods:

```jsx harmony
reactComp3
	.setJsxPath('site/parts/other-folder/other-file')
	.setId('myTargetContainer')
	.uniqueId()
	.setProps({greetee: 'world'});
```

##### Rendering
The instance object renders the HTML body and the activating [page contributions](https://xp.readthedocs.io/en/stable/developer/site/contributions.html) separately. In both steps previous body and pageContributions can be added as input and have the results added to them. This allows rendering _chains_. 

The HTML:

 - `.renderComponentString(overrideProps)` returns a static HTML string of the instance, server-side-rendered with the instance's existing props - or with `overrideProps` if they are included. This is just the component in it's 'naked' state - no container element or other surrounding HTML.

 - `.renderTargetContainer(body, content)`: returns an HTML string with a target container with an element ID that matches the ID of the instance object. 
   - `body` (HTML string, optional): if missing, a new container element will be created. If `body` is included but there's no element in it with a matching ID in it, a matching-ID element will be created and added at the end of `body`, in its root.  If there is already an included matching ID element, `body` will be used as-is (and if `content` is missing too, it will be returned unchanged). 
   - `content` (HTML string, optional): if included, this HTML will be inserted into the target container.
   
 - `.renderSSRIntoContainer(body)` returns an HTML string with the instance server-side-rendered into the `body` (if included - in not, a new container is created, along the logic from `.renderComponentString`) with its current props. This is just a shorthand combination of the two previous methods.
 
The pageContributions:

  - `.renderClientPageContributions(pageContributions)`: uses the [jsxPath](#jsxpath-how-to-refer-to-a-react4xp-component) set in the instance to track which dependency chunks are needed to render the instance component - and then returns the `<script>` elements needed on the output page for rendering the component (`ReactDOM.render`). If the `pageContributions` (pageContributions object or stringparameter is set, it's added to the output (preventing duplicates).
  
  - `.renderHydrationPageContributions(pageContributions)`: works the same way as `.renderClientPageContributions`, but triggers `ReactDOM.hydrate` instead of .render. This makes the client [activate a server-side-rendered React component](https://reactjs.org/docs/react-dom.html#hydrate). 


Completing the example above, with server-side-rendering:
```jsx harmony
exports.get = req => {
    
	// ...continuing from above:
	
	let body = reactComp.renderSSRIntoContainer();
	body = reactComp2.renderSSRIntoContainer(body);
	body = reactComp3.renderSSRIntoContainer(body);
	
	let pageContributions = reactComp.renderHydrationPageContributions();
	pageContributions = reactComp2.renderHydrationPageContributions(pageContributions);
	pageContributions = reactComp3.renderHydrationPageContributions(pageContributions);    
	
	return {
	    body: body,
	    pageContributions: pageContributions
	};
};
```

In this example, chaining is used to let a single XP part display multiple React entries. It's of course also possible to let several XP parts share a common React4xp entry, and even display them on the same page simultaneously.

The same instance objects could of course be used for pure client-side rendering instead, e.g:

```jsx harmony
exports.get = req => {
	// ...    
	let body = reactComp.renderTargetContainer();
	// ...
	let pageContributions = reactComp.renderClientPageContributions();
	// ...
};
```

### React state: rendering class components

For rendering stateful class components, simply wrap them at the export:

```jsx harmony
import React from 'react';

class WorldGreeter expands React.Component {
    constructor(props) {
        this.state = {
            greetee: props || "world",
        }
    }
    
    render() {
        return (<p>Hello {this.state.greetee}!</p>);
    }
}

export default (props) => <WorldGreeter {...props} />;
```

---

# EVERYTHING BELOW HERE IS ABOUT TO BE EDITED/REWRITTEN! 
SOME DETAILS MAY BE DEPRECATED/EXPIRED! 

---

### The services

#### The asset fetcher: /react4xp

Used to fetch all transpiled JS files - entries and dependency chunks - by entry path, i.e. the path of the transpiled file below `build/resources/main/react4xp` (or `/react4xp/` in the JAR). Handles headers for efficient clientside HTTP caching, also caches everything to memory on the server for performance. 

#### The client wrapper: /react4xp-client

TODO

#### The Externals provider: /react4xp-externals

TODO

#### The dependency chunk tracker: /react4xp-dependencies

TODO

---

## Technical details

### How does this thing work?

### Nashorn server-side rendering

The serverside-oriented rendering methods in the library pass the transpiled component by name (entry path / jsxPath) to some java code that loads and runs the component in Nashorn. The Nashorn engine is pre-polyfilled using some other pre-transpiled code (see `src/main/react4xp/_nashornPolyfills_.es6`). 

Each specific component is stored in the nashorn engine by name on first access, as a function that takes props as argument. This way, the components are fairly slow on the first rendering (around 1 second in the test cases) but much faster on repeated access, even with different props (2 - 30 ms). Whether all, or none, or a selection of components should be pre-called and cached on server startup (instead of on the first user access) is up to the parent app developer!

Some other java code, HTMLInserter, is responsible for inserting HTML into other HTML. This is used for adding a container element to an existing body if it's missing a maching-ID target container, and to insert a rendered component into a target container in a preexisting body.

Errors on serverside are logged thoroughly for developers, and a minimal error message is returned as HTML for visible frontend output. When errors happen, the component in question is cleared from the engine's component cache.

Nashorn server-side rendering is recommended in the edit mode of XP content studio, to isolate away active scripts (which may interfere with the editing) while still keeping a visual representation of the component. The basic `.render` method selects this automatically.

#### Support, versions and polyfilling

While most react components so far seem to run fine, there may be some cases where the Nashorn engine will complain. If so, you could: 
  - adapt your component code,
  - [tell us about it](https://github.com/enonic/react4xp-runtime-nashornpolyfills/issues), 
  - fork [react4xp-runtime-nashornpolyfills](https://github.com/enonic/react4xp-runtime-nashornpolyfills) and add your own polyfilling.

The JS support in Nashorn varies between different JVMs. Enonic XP 6 runs the java 8 JVM, while XP 7 will run java 11, which has better support - including ES6 natively. There may still be uncovered areas and unsupported functions, though.


### Component-less entries

If a JSX file is found under `src/main/react4xp/_components` or below, it will keep that relative path and be transpiled to an entry component. Good for component entries that shouldn't belong to a particular XP part/page. Files will be transpiled to the `/react4xp/` root folder, and their entry names will be the file path under `_components`, i.e. without "_components" or "site" (or file extension) in the name.

