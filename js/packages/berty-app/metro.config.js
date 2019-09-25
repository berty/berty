/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const path = require('path')

module.exports = {
  transformer: {
    getTransformModulePath: () => {
      return require.resolve('react-native-typescript-transformer')
    },
    getSourceExts: () => {
      return ['ts', 'tsx']
    },
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
        get: (target, name) => path.join(process.cwd(), `node_modules/${name}`),
      }
    ),
  },
  watchFolders: [path.join(process.cwd(), '../react-native-core')],
}
