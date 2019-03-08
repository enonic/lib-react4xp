module.exports = {
    getAssetRoot: (rawAssetUrlRoot) => {
        let assetUrlRoot = rawAssetUrlRoot.replace(/\$\{app\.name\}/g, app.name);
        if (!assetUrlRoot.endsWith('/')) {
            assetUrlRoot += '/';
        }
        return assetUrlRoot;
    }
};


