import { ConfigPlugin } from "@expo/config-plugins";

const withIosBundleIdentifier: ConfigPlugin = (config) => {
	if (!config.ios) {
		config.ios = {};
	}

	config.ios.bundleIdentifier = "tech.berty.ios";

	return config;
};

export default withIosBundleIdentifier;
