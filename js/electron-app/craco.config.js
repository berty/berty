const path = require("path");

module.exports = {
	webpack: {
		configure: webpackConfig => {
			webpackConfig.resolve.plugins = webpackConfig.resolve.plugins.filter(
				p => p.constructor.name !== "ModuleScopePlugin"
			)

			// ts-loader is required to reference external typescript projects/files (non-transpiled)
			webpackConfig.module.rules.push({
				test: /\.tsx?$/,
				loader: 'ts-loader',
				// exclude: /node_modules/,
				options: {
					transpileOnly: true,
					configFile: 'tsconfig.json',
				},
			})

			return webpackConfig;
		},
		alias: {
			'@berty': path.join(path.resolve(__dirname, '../packages/')),
		},
	}
}
