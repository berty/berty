const path = require('path')
const webpack = require('webpack')
const {
  useBabelRc,
  override,
  useEslintRc,
  babelInclude,
  getBabelLoader,
  addWebpackAlias,
  addWebpackPlugin,
} = require('customize-cra')

const useBabelConfig = path => config => {
  getBabelLoader(config).options.configFile = path
  return config
}

const babelExclude = exclude => config => {
  getBabelLoader(config).exclude = exclude
  return config
}

module.exports = override(
  useBabelRc(),
  useEslintRc(),
  babelInclude(path.resolve('..')),
  babelExclude(
    /node_modules\/(?!(react-native.*|react-navigation.*|@react-navigation\/native|@react-navigation\/core|cavy)\/).*/
  ),
  useBabelConfig(path.resolve('../babel.config.js')),
  addWebpackAlias({
    'react-native': 'react-native-web',
    'react-native-svg': 'react-native-svg-web',
    'node-libs-react-native/globals': 'node-libs-browser',
    'node-libs-react-native': 'node-libs-browser',
  }),
  addWebpackPlugin(new webpack.DefinePlugin({ __DEV__: true }))
)
