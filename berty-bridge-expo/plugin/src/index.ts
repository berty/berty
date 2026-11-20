import { ConfigPlugin } from "@expo/config-plugins";
import { withPlugins } from "expo/config-plugins";

import withAndroidMdnsPermissions from "./withAndroidMdnsPermissions";
import withBlePermissions from "./withBlePermissions";
import withIosEntitlements from "./withIosEntitlements";
import withIosDeploymentTarget from "./withIosDeploymentTarget";
import withIosPlist from "./withIosPlist";
import withIosPush from "./withIosPush";
import withIosTeamId from "./withIosTeamId";
import withBridgingHeader from "./withBridgingHeader";
import withBertyNotificationService from "./withAndroidNotificationService";
import withAndroidBackgroundService from "./withAndroidBackgroundService";
import withAndroidNotificationIcons from "./withAndroidNotificationIcons";

const withConfig: ConfigPlugin = (config) => {
	return withPlugins(config, [
		withIosPlist,
		withIosTeamId,
		withIosPush,
		withIosEntitlements,
		withIosDeploymentTarget,
		withBridgingHeader,
		withAndroidMdnsPermissions,
		withBlePermissions,
		withBertyNotificationService,
		withAndroidBackgroundService,
		withAndroidNotificationIcons,
	]);
};

export default withConfig;
