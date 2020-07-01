var utilLib = require("/lib/util");
var ioLib = require("/lib/xp/io");

// Adjusted from https://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
exports.hash = string => {
  var hash = 0,
    i,
    chr;
  if (string.length === 0) return hash;
  for (i = 0; i < string.length; i++) {
    chr = string.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
};

exports.getResourceAsString = resource =>
  utilLib.data.forceArray(ioLib.readLines(resource.getStream())).join("\n");

exports.getReact4xpEntry = resource => {
  //const then = new Date().getTime();
  const fileContent = exports.getResourceAsString(resource);
  const ETag = exports.hash(fileContent);
  //const now = new Date().getTime();
  //.info(`ETag '${ETag}' in ${now - then} ms.`);
  return {
    body: fileContent,
    headers: {
      "Content-Type": "application/javascript;charset=utf-8",
      "Cache-Control": "no-cache",
      ETag
    }
  };
};

exports.getReact4xpHashedChunk = (resource, isCss) => {
  const fileContent = exports.getResourceAsString(resource);
  return {
    body: fileContent,
    headers: {
      "Content-Type": isCss
        ? "text/css;charset=utf-8"
        : "application/javascript;charset=utf-8",
      "Cache-Control": "public, max-age=31536000"
    }
  };
};
