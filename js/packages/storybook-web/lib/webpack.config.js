const path = require('path')

module.exports = ({ config: storybookBaseConfig }) => {
  storybookBaseConfig.resolve.alias['^react-native$'] = 'react-native-web'
  storybookBaseConfig.resolve.symlinks = false

  // TODO: replace by find
  const babelRule = storybookBaseConfig.module.rules[0]

  // Override test because storybook ignores tsx
  babelRule.test = /\.(mjs|jsx?|tsx?)/

  babelRule.include = [
    path.resolve(__dirname, 'config.js'),
    path.resolve(__dirname, '../node_modules/@berty-tech/berty-storybook'),
  ]
  babelRule.exclude = []

  const babelConfig = babelRule.use[0]

  babelRule.use[0] = {
    ...babelConfig,
    options: {
      ...babelConfig.options,
      presets: ['@berty-tech/babel-preset'],
      plugins: ['react-native-web'],
    },
  }

  return storybookBaseConfig
}
