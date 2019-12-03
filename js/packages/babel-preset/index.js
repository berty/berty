module.exports = () => ({
	presets: [
		__dirname + '/node_modules/metro-react-native-babel-preset',
		['@babel/preset-typescript', { allowNamespaces: true }],
	],
	plugins: [
		[
			'transform-inline-environment-variables',
			{
				include: ['ENABLE_TEST_IDS'],
			},
		],
	],
})
