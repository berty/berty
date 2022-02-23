const path = require('path')
const webpack = require('webpack')

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
			'@berty-tech': path.join(path.resolve(__dirname, '../packages/')),
			'react': path.resolve(path.resolve(__dirname, './node_modules/react')),
			'^react-native$': path.resolve(path.resolve(__dirname, './node_modules/react-native')),
			'react-native-svg': path.resolve(path.resolve(__dirname, './node_modules/react-native-svg-web')),
			'lottie-react-native': path.resolve(path.resolve(__dirname, './node_modules/react-native-web-lottie')),
		},
	}
}
