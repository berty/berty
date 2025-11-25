import { ConfigPlugin } from "@expo/config-plugins";
import { withPlugins } from "expo/config-plugins";

import withAndroidMdnsPermissions from "./withAndroidMdnsPermissions";
import withBlePermissions from "./withBlePermissions";
import withIosEntitlements from "./withIosEntitlements";
import withIosPlist from "./withIosPlist";
import withIosPush from "./withIosPush";
import withIosTeamId from "./withIosTeamId";
import withBridgingHeader from "./withBridgingHeader";
import withBertyNotificationService from "./withAndroidNotificationService";

const withConfig: ConfigPlugin = (config) => {
	return withPlugins(config, [
		withIosPlist,
		withIosTeamId,
		withIosPush,
		withIosEntitlements,
		withBridgingHeader,
		withAndroidMdnsPermissions,
		withBlePermissions,
		withBertyNotificationService,
	]);
};

export default withConfig;
