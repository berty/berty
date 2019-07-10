const path = require('path')
const {
  useBabelRc,
  override,
  useEslintRc,
  babelInclude,
  getBabelLoader,
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
  useBabelConfig(path.resolve('../../../babel.config.js'))
)
