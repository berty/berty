const path = require('path')
const fs = require('fs')

const pkgJSON = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../package.json'))
)

const storybooks = Object.keys(pkgJSON.dependencies).filter((key) =>
  /@berty-tech\/.*-storybook/.test(key)
)

console.log('storybooks', storybooks)

module.exports = ({ config: storybookBaseConfig }) => {
  storybookBaseConfig.resolve.alias['react-native-web'] = path.resolve(
    __dirname,
    '..',
    'node_modules',
    'react-native-web'
  )

  // TODO: replace by find
  const babelRule = storybookBaseConfig.module.rules[0]

  // Override test because storybook ignores tsx
  babelRule.test = /\.(mjs|jsx?|tsx?)$/

  if (!Array.isArray(babelRule.include)) {
    babelRule.include = [babelRule.include]
  }

  babelRule.include = babelRule.include.concat([
    ...storybooks.map((s) =>
      path.resolve(__dirname, '..', '..', s.split('/')[1])
    ),
    path.resolve(__dirname, '..', '..', 'components'),
  ])

  console.log('babelRule.include', babelRule.include)

  const babelConfig = babelRule.use[0]

  babelRule.use[0] = {
    ...babelConfig,
    options: {
      ...babelConfig.options,
      presets: [...babelConfig.options.presets, '@berty-tech/babel-preset'],
      plugins: [...babelConfig.options.plugins, 'react-native-web'],
    },
  }

  console.log('babelRule.options', babelRule.use[0].options)

  return storybookBaseConfig
}
