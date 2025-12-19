import { AndroidConfig, type ConfigPlugin } from "@expo/config-plugins";

const withAndroidMdnsPermissions: ConfigPlugin = (config) => {
	config = AndroidConfig.Permissions.withPermissions(config, [
		"android.permission.CHANGE_WIFI_MULTICAST_STATE",
	]);

	return config;
};

export default withAndroidMdnsPermissions;
