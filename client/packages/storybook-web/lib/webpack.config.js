const path = require("path");
const webpack = require("webpack");

module.exports = ({config: storybookBaseConfig}) => {
  storybookBaseConfig.resolve.alias["^react-native$"] = "react-native-web";
  storybookBaseConfig.resolve.symlinks = false;

  // TODO: replace by find
  const babelRule = storybookBaseConfig.module.rules[0];

  babelRule.include = [
    path.resolve(__dirname, "config.js"),
    path.resolve(__dirname, "../node_modules/@berty/stories")
  ];
  babelRule.exclude = [];

  const babelConfig = babelRule.use[0];

  babelRule.use[0] = {
    ...babelConfig,
    options: {
      ...babelConfig.options,
      presets: ["module:metro-react-native-babel-preset"],
      plugins: ["react-native-web"]
    }
  };

  return storybookBaseConfig;
};
