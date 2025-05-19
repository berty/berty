import { ConfigPlugin } from "@expo/config-plugins";
import { withPlugins } from "expo/config-plugins";

import withAndroidPermissions from "./withAndroidPermissions";
import withIosBundleIdentifier from "./withIosBundleIdentifier";
import withIosEntitlements from "./withIosEntitlements";
import withIosPlist from "./withIosPlist";
import withIosPush from "./withIosPush";
import withIosTeamId from "./withIosTeamId";
import withBridgingHeader from "./withBridgingHeader";

const withConfig: ConfigPlugin = (config) => {
	return withPlugins(config, [
		withIosBundleIdentifier,
		withIosPlist,
		withIosTeamId,
		withIosPush,
		withIosEntitlements,
		withBridgingHeader,
		withAndroidPermissions,
	]);
};

export default withConfig;
