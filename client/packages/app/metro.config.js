/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

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
};
