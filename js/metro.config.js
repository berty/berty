/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const defaultAssetExts = require('metro-config/src/defaults/defaults').assetExts
const defaultSourceExts = require('metro-config/src/defaults/defaults').sourceExts
const exclusionList = require('metro-config/src/defaults/exclusionList')

module.exports = {
	transformer: {
		getTransformOptions: async () => ({
			transform: {
				experimentalImportSupport: false,
				inlineRequires: true,
			},
		}),
		babelTransformerPath: require.resolve('react-native-svg-transformer'),
	},
	resolver: {
		extraNodeModules: require('node-libs-react-native'),
		assetExts: defaultAssetExts.filter(ext => ext !== 'svg'),
		sourceExts: [...defaultSourceExts, 'svg'],
		blacklistRE: exclusionList([/\.gomobile-cache\/.*/, /^web\/.*/]),
	},
}
