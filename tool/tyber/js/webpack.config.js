const createExpoWebpackConfigAsync = require("@expo/webpack-config");

module.exports = async function (env, argv) {
	const config = await createExpoWebpackConfigAsync(
		{
			...env,
			babel: {
				dangerouslyAddModulePathsToTranspile: [
					"@ui-kitten/components",
					"@eliav2/react-native-collapsible-view",
				],
			},
		},
		argv
	);
	if (config.mode === "production") {
		config.target = "electron-renderer";
	}

	return config;
};
