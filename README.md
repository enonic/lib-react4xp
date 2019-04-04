# lib-react4xp-runtime

**React for XP: handling and rendering of pre-built React components in Enonic XP**

This library runs on [Enonic XP](https://enonic.com/developer-tour) server side, and provides:
  - services that serve pre-compiled React components and their dependency scripts to the browser, from a specific file structure. The package [react4xp-build-components](https://www.npmjs.com/package/react4xp-build-components) builds this structure from React source files. These services also provide headers for caching components and dependencies in the browser.
  - library of XP controller functions, that make it easy to blend React into XP components, in a variety of ways
  - server-side rendering option in XP, through the controller functions  
  - client-side wrapper tailored for use with the services - itself available to the browser through one of the services. 
    

## Jump to:
  - [Install](#install)
    - [1: Prerequisites](#1-prerequisites)
    - [2: Download](#2-download)
    - [3: Install this lib](#3-install-this-lib-locally)
    - [4: NPM: import packages](#4-npm-import-packages-in-the-parent-project)
    - [5: Gradle: import the installed lib](#5-gradle-import-the-installed-lib-in-the-parent-project)
    - [6: Gradle: set up the build steps](#6-gradle-set-up-the-build-steps-using-the-lib)
    - [7: Optional: transpiling XP components](#7-xp-component-transpilation-optional)
    - [8: Build and deploy the parent app](#8-build-and-run-it-all)
    
  - [Overview](#overview)
    - [Usage: 3 main ways to render](#usage-3-main-ways-to-render)
    - [jsxPath: how to refer to a component](#jsxpath-how-to-refer-to-a-react4xp-component)
    - [Entries and Chunks](#entries-and-dependency-chunks) 
      - [Control your structure](#how-to-control-your-entrychunk-structure)
    
  - [Examples: Hello World in the 3 main ways](#examples-hello-world)
    - [From a Content Studio ready component](#1-content-studio-ready-component)
    - [From an XP controller outside of Content Studio](#2-from-an-xp-controller-outside-of-content-studio)
	- [From the client: standalone HTML page](#3-completely-standalone-html) 

  - [Advanced use, technical stuff](#advanced-use-and-other-technical-stuff)



## Install

_This library is a work in progress at the moment_. The install process will be simplified before long, in particular publishing this lib on [Enonic Market](https://market.enonic.com/), and using a Gradle plugin to import it into your XP project. 

If you still want to try it out right now, here's how:

### 1: Prerequisites
Assuming you have Enonic XP nicely installed, and you have an **XP parent project** app set up for it (a project where you want to use React4xp). Look for a React4xp starter in Enonic Market.
  
### 2: Download
Clone or otherwise download [the source code for this lib](https://github.com/enonic/lib-react4xp-runtime.git) into _its own root folder_ (not into XP_INSTALL or the parent project folder). 
  
### 3: Install this lib locally
From that folder, run:
```bash
gradlew build install
```
Gradle will build the library and install it into the local cache, available for other projects.

### 4: NPM: import packages in the parent project 
Now go to the _parent XP project folder_. Either add these packages to `package.json` as `devDependencies`, or install them from your command line (`npm add --save-dev ...`):
```json
devDependencies: {
	"react4xp-buildconstants": "0.6.0",
	"react4xp-build-components": "0.2.0",
	"react4xp-runtime-externals": "0.1.0",
  }
```
The last one of these are optional. Depends on whether you use it in `build.gradle` in step 6 below - it is used in these instructions.

Two other NPM packages are mentioned/commented out in step 6, but already included in this library. You only need to install those here if you need to use other or customized versions:
  - `react4xp-runtime-client` (included version: 0.2.5)
  - `react4xp-runtime-nashornpolyfills` (included version: 0.1.1)

Remember to add any peer dependencies you might be missing in the parent project.

##### All package docs:
  - [react4xp-buildconstants](https://www.npmjs.com/package/react4xp-buildconstants)
  - [react4xp-build-components](https://www.npmjs.com/package/react4xp-build-components)
  - [react4xp-runtime-externals](https://www.npmjs.com/package/react4xp-runtime-externals)
  - [react4xp-runtime-client](https://www.npmjs.com/package/react4xp-runtime-client)
  - [react4xp-runtime-nashornpolyfills](https://www.npmjs.com/package/react4xp-runtime-nashornpolyfills)

 
### 5: Gradle: import the installed lib in the parent project 
Insert into `build.gradle` in the parent project, under `dependencies`:
```groovy
dependencies {
    include 'com.enonic.lib:lib_react4xp_runtime:0.1.0-SNAPSHOT'
}
```
The `0.1.0-SNAPSHOT` part is of course the version of this library, and must match the actual version that you built and installed in step 2 and 3.

### 6: Gradle: set up the build steps using the lib
Your parent project needs two important gradle tasks: 
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

### 7: XP component transpilation (optional)

If you want Babel (etc) transpilation for your XP controllers, **this needs to be done separately from the build tasks in step 5!** 

(Why? For simple development after everything's set up, React4xp encourages you to keep React entry components in the same folders as the corresponding XP components that uses them. But both build- and runtime handles React and XP components very differently. For that reason **they must have different file extensions**: .JSX and .ES6, respectively. Typescript support should be fairly easy to add)

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

### 8: Build and run it all
And voilà! Such easy! From the parent project, this can now be run as a regular XP app:
```bash
$ cd <project folder>
$ gradlew deploy
$ cd <XP server folder>
$ bin/server
```

    

## Overview

Taking a look at the 3 main approaches to rendering with React4xp, as well as two important concepts: the `jsxPath`, and _entries_.

### Usage: 3 main ways to render

There are 3 main ways to use this library with XP:

1. React components **directly inside XP components in Content Studio** (parts and pages for now, although layouts _might_ work). That is, the React component is part of an XP component's view, and handled and referred in the XP component's controller. This approach is made to be easy to use, and lets the controller fetch data in regular XP ways (portalLib's `.getComponent`, `.getContent` etc), and also has methods for server-side rendering and client-side hydration - as well as automatically adding headers for effective client-side caching of the resources. This mode can also automate the HTML side of things if you want - handling the React insertion container by itself, even without a specific HTML view file for the part/page if necessary.

2. React components in web pages that are rendered by XP controllers, but **outside the XP Content Studio flow** - for example when getting a page from an XP webapp or a service. This approach also has access to XP's serverside logic and the React4xp helper methods of this library, but makes a manual reference to the React component (this can also be done in the first component-oriented approach, if needed).

3. **Standalone client-side mode**. In this case, an HTML file loads the react4xp client script from the `/react4xp-client` service. This exposes methods that a browser can call. It can either manually trigger rendering of already-loaded components, or use a method that automates it: just list the React4xp component names, their target container IDs and their props, and let the client call the services in _this_ lib to first find URLs for the dependency resources needed, download and run them, and finally trigger their rendering. This requires this library to provide the services, but otherwise uses the [react4xp-runtime-client package](https://www.npmjs.com/package/react4xp-runtime-client)  (**included in this library, no need for a separate installation**) - look there for docs and examples on the standalone mode.


### jsxPath: how to refer to a React4xp component
**The jsxPath** is React4xp's internal name for each [Entry](#jsxpath-how-to-refer-to-a-react4xp-component) component. When you have the jsxPath, you can use the component from anywhere in a lot of React4xp's methods - including a standalone HTML file.

The name is derived at build time, from the path of the transpiled react component, relative to a particular target folder in the JAR artifact of your app. But make no mistake, `jsxPath` is a _name string_, not a path that can be used relatively! In short: 

- A JSX source file can be **bound to an XP component**, that is, the source file is inside the folder of an XP component, under `<projectFolder>/src/main/resources/site/<component-type>/<component-name>/`. The jsxPath will then be _the XP-relative path to the JSX file_ (starts with `site/...`), without the file extension. 

- If a JSX file is **independent from XP components**, the source file should be put below a special source folder in order for all the automatics to work: `<projectFolder>/src/main/react4xp/_components/` (*). The jsxPath will then be the path-and-name of the source file relative to that folder (still without file extension) (the path to this magic folder can be adjusted with the React4xp config file)


**So in the examples below**...
 - the XP-component-bound file `<projectFolder>/src/main/resources/site/parts/example/example.jsx`. It will get the jsxPath `"site/parts/example/example"`, 
 - while `<projectFolder>/src/main/react4xp/_components/SimpleGreeter.jsx` is independent and will get the jsxPath `"SimpleGreeter"`. 
 
When your app is built by [react4xp-build-components](https://www.npmjs.com/package/react4xp-build-components), it creates an overview file of all the available components and their jsxPaths: see `<projectFolder>/build/main/resources/react4xp/entries.json` (*). You can use this file for lookup, but don't edit or delete it - it's an active part of the runtime.

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




## Advanced use and other technical stuff

---

# EVERYTHING BELOW HERE NEEDS SOME EDITING, SOME DETAILS MAY BE DEPRECATED/EXPIRED: 

---

### Easy and direct rendering with `React4xp.render` 

`React4xp.render(request, params)` generates an object with `body` and `pageContribution` attributes, ready for being returned as-is from an XP controller. The HTML `body` will contain a target container for the rendered component, inside an HTML body if one was was included in the `params` argument object, or generated if not. 

The `request` argument is used to determine the context of the rendering: 
  - If the rendering happens in the _edit_ mode of XP Content Studio, the react component is rendered server-side as static HTML. In this mode, any pageContributions from the `params` are just passed through unchanged.  
  - If the rendering is in _preview_ or _live_ mode: client-side rendering. The body is ensured to contain a matching-ID target container for rendering in the browser, while the pageContributions get scripts for this rendering - inline and referred by autogenerated URLs.
  
The `params` argument is an object that must include EITHER `component` or  `jsxPath`. All other parameters are optional:
  - `component` (object) XP component object (used to extrapolate a jsxPath - sufficient if JSX entry file is in the same folder and has the same name).
  - `jsxPath` (string) path to react component entry, see available paths in `build/main/resources/react4xp/entries.json` after building. Think of this as the name of the component path.
  - `props` (object) React props to send in to the react component
  - `id` (string) Sets the target container HTML element ID. If this matches an ID in a `body` in params, the react component will be rendered there. If not, a container with this ID will be added. If `id` is missing, the `component` path is used, or a unique ID is generated if there's no component.
  - `uniqueId` (boolean or string) If set, ensures that the ID is unique. If the `id` param is set, a random integer will be postfixed to it. If `uniqueId` is a string, that will be the prefix before the random postfix. If the `id` param is used in addition to a `uniqueId` string, `uniqueId` takes presedence and overrides `id`.
  - `body` (string) Existing HTML body for adding the react component into. For example rendered from thymeleaf. If it already has a matching-ID target container, `body` passes through unchanged in client-side rendering, and has the react component added to the container in server-side rendering. Use this matching-ID option and set the `id` param to control where in the body the react component should be inserted. If there's no matching container, a matching <div> will be inserted at the end of the body, inside the root element of `body`. If `body` is missing, a pure-target-container body is generated and returned.
  - `pageContributions` (object) Pre-existing pageContributions.


### The library: `lib/enonic/react4xp/index.es6` 

Used in XP controllers. Relies on webpack having done its job (setting up the entry paths, the hashed chunk names and the correct placement of all the files), and handles the interplay between backend and frontend mainly using the entry paths. In addition to the `.render` method from the hello-world example are some other options:
  - `React4xp.renderSSR(params)`: Same as React4xp.render, but without the `request`, and always renders static server-side markup. No need for a `request` argument. Worth noting: the first server-side rendering in Nashorn is much slower than repeated calls to the same component. The component is cached as a function, so re-calling it even with different props will be much more performant. 
  - `React4xp.renderClient(params)`: Same as React4xp.renderSSR, but always renders active client-side react. Might nota always work so well in XP content studio's edit mode).
  - `React4xp.renderMarkupAndHydrate(params)`: Same as React4xp.renderSSR, but also tries to activate the component (hydrate; populate the previously rendered DOM with active react functionality). As above, your mileage might vary when it comes to how it behaves in XP content studio's edit mode.
  
For more fine-grained control, build a **React4xp instance**. This can be done in two ways:
  - `new React4xp(initParam);`, the basic constructor where `initParam` is either the XP component object, or an entry path string, or
  - `React4xp.buildFromParams(params)`, an all-in-one builder where `params` are the same as for `.renderSSR` and `.renderClient`, except for the `body` and `pageContributions` fields which aren't used here. 
  
This React4xp instance has the following methods:
  - `.setId(id)`: Sets the ID of the target container the component will be rendered into, or deletes it if omitted.
  - `.uniqueId()`: Makes sure the container ID is uinique, using a random postfix.
  - `.setJsxFileName(fileName)`: Adjusts the jsxPath by changing the file name. Useful for different-named jsx files when using the component shortcut.
  - `.setProps(props)`: Sets the component's top-level props.
  - `.renderClientPageContributions(pageContributions)`: Renders only the needed pageContributions for running the component on the client side. Includes dependency chunks, the component script, and the trigger. If a `pageContributions` argument is added, the rendered pageContributions are added to it, removing any duplicate scripts.
  - `.renderTargetContainer(body, content)`: Generates an HTML body string (or modifies it, if included as a `body` parameter) with a target container element with the ID of this component - into which the component will be rendered. If the component HTML already has been rendered (e.g. by `.renderToString`), add it as the `content` argument, and it will be inserted into the container.
  - `.renderToString(overrideProps)`: Renders a pure static HTML string of the react component, without a body / other surrounding HTML. If `overrideProps` is added, any props previously added to the instance are ignored.
  - `.renderIntoBody(body)`: Shorthand method, combining `renderToString` and `renderTargetContainer` for a full serverside HTML string rendering of the instance. 

The **examples** branch in this repo should have more on how to use this library in controllers.


### The service: `services/react4xp/react4xp.es6`

Used to fetch all transpiled JS files - entries and dependency chunks - by entry path, i.e. the path of the transpiled file below `build/resources/main/react4xp` (or `/react4xp/` in the JAR). Handles headers for efficient clientside HTTP caching, also caches everything to memory on the server for performance. 


### Nashorn server-side rendering

The serverside-oriented rendering methods in the library pass the transpiled component by name (entry path / jsxPath) to some java code that loads and runs the component in Nashorn. The Nashorn engine is pre-polyfilled using some other pre-transpiled code (see `src/main/react4xp/_nashornPolyfills_.es6`). 

Each specific component is stored in the nashorn engine by name on first access, as a function that takes props as argument. This way, the components are slow on the first rendering (around 1 second in the test cases) but much faster on repeated access, even with different props (2 - 30 ms).

Some other java code, HTMLInserter, is responsible for inserting HTML into other HTML. This is used for adding a container element to an existing body if it's missing a maching-ID target container, and to insert a rendered component into a target container in a preexisting body.

Errors on serverside are logged thoroughly for developers, and a minimal error message is returned as HTML for visible frontend output. When errors happen, the component in question is cleared from the engine's component cache.

Nashorn server-side rendering is recommended in the edit mode of XP content studio, to isolate away active scripts (which may interfere with the editing) while still keeping a visual representation of the component. The basic `.render` method selects this automatically.

#### Support, versions and polyfilling

While most react components so far seem to run fine, there may be some cases where the Nashorn engine will complain. If so, adapt your code, or add polyfilling to `src/main/react4xp/_nashornPolyfills_.es6`.

The JS support in Nashorn varies between different JVMs. Enonic XP 6 runs the java 8 JVM, while XP 7 will run java 11, which has better support - including ES6 natively. There may still be uncovered areas and unsupported functions, though.


### Component-less entries

If a JSX file is found under `src/main/react4xp/_components` or below, it will keep that relative path and be transpiled to an entry component. Good for component entries that shouldn't belong to a particular XP part/page. This approach is untested and not focused on, but should allow pure-app use. Files will be transpiled to the `/react4xp/` root folder, and their entry names will be the file path under `_components`, i.e. without "_components" or "site" (or file extension) in the name.


### Stateful class components

For rendering stateful class components, they must be wrapped during the export:

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

## More examples

See the examples branches.
