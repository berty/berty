const path = require('path')
const glob = require('glob')

module.exports = ({ config: storybookBaseConfig }) => {
	storybookBaseConfig.resolve.alias['^react-native$'] = 'react-native-web'
	storybookBaseConfig.resolve.alias['^@storybook/react-native$'] = '@storybook/react'
	storybookBaseConfig.resolve.symlinks = true

	// TODO: replace by find
	const babelRule = storybookBaseConfig.module.rules[0]

	// Override test because storybook ignores tsx
	babelRule.test = /\.(mjs|jsx|ts|tsx)$/

	babelRule.include = [
		path.resolve(__dirname, 'config.js'),
		/node_modules\/@berty-tech\/.*-storybook\//,
	]
	console.log(...glob.sync(__dirname + '/../node_modules/@berty-tech/*-storybook'))

	const babelConfig = babelRule.use[0]

	babelRule.use[0] = {
		...babelConfig,
		options: {
			...babelConfig.options,
			presets: ['@berty-tech/babel-preset'],
			plugins: ['react-native-web'],
		},
	}

	return storybookBaseConfig
}
