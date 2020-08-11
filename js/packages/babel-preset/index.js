module.exports = () => ({
	presets: [
		__dirname + '/node_modules/metro-react-native-babel-preset',
		['@babel/preset-typescript', { allowNamespaces: true }],
	],
	plugins: [
		[
			'module:react-native-dotenv',
			{
				moduleName: '@env',
				path: '.env',
				blacklist: null, // Ignore specified env var key
				whitelist: null, // Only import specified env var key
				safe: false, // Only allow environment variables defined in the env file
				allowUndefined: true, // Allow importing missing env var key
			},
		],
	],
})
