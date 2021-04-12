exports.forceArray = item => !item
    ? []
    : Array.isArray(item)
        ? item
        : [item];
