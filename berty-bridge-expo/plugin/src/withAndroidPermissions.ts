import { ConfigPlugin, withAndroidManifest } from "@expo/config-plugins";

const withAndroidPermissions: ConfigPlugin = (config) => {
	return withAndroidManifest(config, (config) => {
		const androidManifest = config.modResults.manifest;
		const permissions = androidManifest["uses-permission"] || [];

		androidManifest["uses-permission"] = [
			...permissions,
			{
				$: {
					"android:name": "android.permission.CHANGE_WIFI_MULTICAST_STATE",
				},
			},
		];
		return config;
	});
};

export default withAndroidPermissions;
