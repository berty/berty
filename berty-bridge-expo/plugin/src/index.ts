import { ConfigPlugin } from "@expo/config-plugins";
import { withPlugins } from "expo/config-plugins";

import withAppleTeamId from "./withAppleTeamId";
import withBundleIdentifier from "./withBundleIdentifier";
import withPlist from "./withPlist";
import withPush from "./withPush";

const withConfig: ConfigPlugin = (config) => {
	return withPlugins(config, [
		withBundleIdentifier,
		withPlist,
		withAppleTeamId,
		withPush,
	]);
};

export default withConfig;
// export default withBundleIdentifier;
