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
	...glob.sync(path.join(__dirname, '../../node_modules/@berty-tech/*'), {
		realpath: true,
	}),
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
		extraNodeModules: new Proxy(require('node-libs-react-native'), {
			get: (target, name) => {
				const current = path.join(__dirname, `./node_modules/${name}`)
				const root = path.join(__dirname, `../../node_modules/${name}`)
				if (fs.existsSync(root)) {
					return root
				}
				return current
			},
		}),
	},
	watchFolders,
	server: {
		enableVisualizer: true,
	},
}
