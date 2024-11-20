import { ConfigPlugin } from "@expo/config-plugins";

const withPlist: ConfigPlugin = (config) => {
	if (!config.ios) {
		config.ios = {};
	}
	if (!config.ios.infoPlist) {
		config.ios.infoPlist = {};
	}

	config.ios.infoPlist["appGroupID"] = "group.tech.berty";

	return config;
};

export default withPlist;
