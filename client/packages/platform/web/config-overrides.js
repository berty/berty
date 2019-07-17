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

const useBabelPath = path => config => {
  getBabelLoader(config).options.cwd = path
  return config
}

module.exports = override(
  useBabelRc(),
  useEslintRc(),
  babelInclude(path.resolve('../../..')),
  useBabelConfig(path.resolve('../../../babel.config.js')),
  addWebpackAlias({
    'react-native': 'react-native-web',
  }),
  addWebpackPlugin(new webpack.DefinePlugin({ __DEV__: true }))
)
