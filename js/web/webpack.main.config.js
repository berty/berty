const path = require('path');

module.exports = {
	mode: 'production',
	target: 'electron-renderer',
	entry: './src-main/main.ts',
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				loader: 'ts-loader',
				exclude: /node_modules/,
				options: {
					transpileOnly: true,
					configFile: 'tsconfig.main.json',
				},
			},
		],
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
	},
	output: {
		filename: 'main.js',
		path: path.resolve(__dirname, 'build'),
	},
}
