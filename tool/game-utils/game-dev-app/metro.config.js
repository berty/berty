/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const path = require('path')

const extraNodeModules = {
	'berty-components': path.resolve(__dirname + '/../../../js/packages/components'),
}
const watchFolders = [path.resolve(__dirname + '/../../../js/packages/components')]

module.exports = {
	transformer: {
		getTransformOptions: async () => ({
			transform: {
				experimentalImportSupport: false,
				inlineRequires: true,
			},
		}),
	},
	resolver: {
		extraNodeModules: new Proxy(extraNodeModules, {
			get: (target, name) =>
				//redirects dependencies referenced from common/ to local node_modules
				name in target ? target[name] : path.join(process.cwd(), `node_modules/${name}`),
		}),
	},
	watchFolders,
}
