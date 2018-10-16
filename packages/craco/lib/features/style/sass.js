const { getLoaders, loaderByName } = require("../../loaders");
const { log, error } = require("../../logger");
const { isString, isFunction, deepMergeWithArray } = require("../../utils");

function setLoaderProperty(match, key, valueProviders) {
    if (isString(match.loader)) {
        match.parent[match.index] = {
            loader: match.loader,
            [key]: valueProviders.whenString()
        };
    } else {
        match.loader[key] = valueProviders.whenObject();
    }
}

function applyLoaderOptions(match, loaderOptions, context) {
    if (isFunction(loaderOptions)) {
        setLoaderProperty(match, "options", {
            whenString: () => loaderOptions({}, context),
            whenObject: () => loaderOptions(match.loader.options || {}, context)
        });
    } else {
        // TODO: ensure is otherwise a plain object, if not, log an error.
        setLoaderProperty(match, "options", {
            whenString: () => loaderOptions,
            whenObject: () => deepMergeWithArray(match.loader.options || {}, loaderOptions)
        });
    }

    log("Applied SASS loaders options.");
}

function overrideLoader(match, sassOptions) {
    if (sassOptions.loaderOptions) {
        applyLoaderOptions(match, sassOptions.loaderOptions);
    }

    log("Overrided SASS loader.");
}

function overrideSass(styleConfig, webpackConfig) {
    if (styleConfig.sass) {
        const { hasFoundAny, matches } = getLoaders(webpackConfig, loaderByName("sass-loader"));

        if (!hasFoundAny) {
            error("Cannot find any SASS loaders.");

            return webpackConfig;
        }

        matches.forEach(x => {
            overrideLoader(x, styleConfig.sass.loaderOptions);
        });
    }

    return webpackConfig;
}

module.exports = {
    overrideSass
};