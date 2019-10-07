/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const fs = require('fs')
const path = require('path')
const glob = require('glob')

const watchFolders = [
  ...glob.sync(path.join(__dirname, '../*-storybook')),
  path.join(__dirname, './node_modules'),
  path.join(__dirname, '../../node_modules'),
]

module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
  resolver: {
    extraNodeModules: new Proxy(
      {},
      {
        get: (target, name) => {
          const current = path.join(__dirname, `node_modules/${name}`)
          const root = path.join(__dirname, `../node_modules/${name}`)
          if (fs.existsSync(current)) {
            return current
          }
          return root
        },
      }
    ),
  },
  watchFolders,
}
