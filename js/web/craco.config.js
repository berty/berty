const path = require('path')
const webpack = require('webpack')

const polyfillModules = [
	'@gorhom/bottom-sheet',
	'@react-native-community/audio-toolkit',
	'@react-native-community/blur',
	'@react-native-community/cameraroll',
	'react-native-android-keyboard-adjust',
	'react-native-emoji-board',
	'react-native-fs',
	'react-native-image-crop-picker',
	'react-native-image-zoom-viewer',
	'react-native-in-app-notification',
	'react-native-inappbrowser-reborn',
	'react-native-permissions',
	'react-native-progress',
	'react-native-qrcode-scanner',
	'react-native-qrcode-svg',
	'react-native-share',
	'react-native-swipe-gestures',
	'react-native-vector-icons',
	'react-native-webview',
]

module.exports = {
	babel: {
		plugins: ['@babel/plugin-proposal-optional-chaining']
	},
	webpack: {
		target: 'web',
		configure: webpackConfig => {
			webpackConfig.resolve.plugins = webpackConfig.resolve.plugins.filter(
				p => p.constructor.name !== "ModuleScopePlugin"
			)

			webpackConfig.module.rules.push({
				test: /node_modules\/react-native-reanimated.*\.(js|jsx)$/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: [
							'@babel/preset-react',
							{ plugins: ['@babel/plugin-proposal-class-properties'] }
						],
					},
				},
			})

			// ts-loader is required to reference external typescript projects/files (non-transpiled)
			webpackConfig.module.rules.push({
				test: /\.tsx?$/,
				loader: 'ts-loader',
				exclude: /node_modules/,
				options: {
					transpileOnly: true,
					configFile: 'tsconfig.json',
				},
			})

			webpackConfig.module.rules = webpackConfig.module.rules.map(rule => {
				if (rule.oneOf) {
					rule.oneOf.unshift({
						test: /.svg$/,
						exclude: /node_modules/,
						use: [
							{
								loader: require.resolve('@svgr/webpack'),
								options: {
									expandProps: 'end',
									native: true,
								},
							},
						],
					})
				}
				return rule
		})

			webpackConfig.plugins.push(new webpack.DefinePlugin({
				'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
				__DEV__: process.env.NODE_ENV !== 'production' || true,
			}))

			return webpackConfig
		},
		alias: {
			'@berty': path.join(path.resolve(__dirname, '../packages/')),
			...(Object.fromEntries(polyfillModules.map(name => [name, path.join(path.resolve(__dirname, `./src/polyfill/${name}/`))]))),
			'react': path.resolve(path.resolve(__dirname, './node_modules/react')),
			'^react-native$': path.resolve(path.resolve(__dirname, './node_modules/react-native')),
			'react-native-svg': path.resolve(path.resolve(__dirname, './node_modules/react-native-svg-web')),
			'lottie-react-native': path.resolve(path.resolve(__dirname, './node_modules/react-native-web-lottie')),
		},
	}
}
