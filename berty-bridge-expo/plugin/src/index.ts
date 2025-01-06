import { ConfigPlugin } from "@expo/config-plugins";
import { withPlugins } from "expo/config-plugins";

import withIosBundleIdentifier from "./withIosBundleIdentifier";
import withIosEntitlements from "./withIosEntitlements";
import withIosPlist from "./withIosPlist";
import withIosPush from "./withIosPush";
import withIosTeamId from "./withIosTeamId";

const withConfig: ConfigPlugin = (config) => {
	return withPlugins(config, [
		withIosBundleIdentifier,
		withIosPlist,
		withIosTeamId,
		withIosPush,
		withIosEntitlements,
	]);
};

export default withConfig;
