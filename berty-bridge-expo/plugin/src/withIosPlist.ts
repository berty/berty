import { ConfigPlugin, withInfoPlist } from "@expo/config-plugins";

const withIosPlist: ConfigPlugin = (config) => {
	return withInfoPlist(config, (config) => {
		if (!config.ios) {
			config.ios = {};
		}
		if (!config.ios.infoPlist) {
			config.ios.infoPlist = {};
		}

		config.ios.infoPlist["appGroupID"] = "group.tech.berty";

		// background

		if (!Array.isArray(config.modResults.BGTaskSchedulerPermittedIdentifiers)) {
			config.modResults.BGTaskSchedulerPermittedIdentifiers = [];
		}

		if (
			!config.modResults.BGTaskSchedulerPermittedIdentifiers.includes(
				"tech.berty.ios.task.gobridge-process"
			)
		) {
			config.modResults.BGTaskSchedulerPermittedIdentifiers.push(
				"tech.berty.ios.task.gobridge-process"
			);
		}

		if (
			!config.modResults.BGTaskSchedulerPermittedIdentifiers.includes(
				"tech.berty.ios.task.gobridge-refresh"
			)
		) {
			config.modResults.BGTaskSchedulerPermittedIdentifiers.push(
				"tech.berty.ios.task.gobridge-refresh"
			);
		}

		if (!Array.isArray(config.modResults.UIBackgroundModes)) {
			config.modResults.UIBackgroundModes = [];
		}

		if (!config.modResults.UIBackgroundModes.includes("fetch")) {
			config.modResults.UIBackgroundModes.push("fetch");
		}

		if (!config.modResults.UIBackgroundModes.includes("processing")) {
			config.modResults.UIBackgroundModes.push("processing");
		}

		if (!config.modResults.UIBackgroundModes.includes("remote-notification")) {
			config.modResults.UIBackgroundModes.push("remote-notification");
		}

		return config;
	});
};

export default withIosPlist;
