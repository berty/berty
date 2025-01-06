import { ConfigPlugin } from "@expo/config-plugins";

const withIosPlist: ConfigPlugin = (config) => {
	if (!config.ios) {
		config.ios = {};
	}
	if (!config.ios.appleTeamId) {
		config.ios.appleTeamId = "WMBQ84HN4T";
	}

	return config;
};

export default withIosPlist;
