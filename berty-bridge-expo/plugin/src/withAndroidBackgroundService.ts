import {
	AndroidConfig,
	type ConfigPlugin,
	withAndroidManifest,
} from "@expo/config-plugins";

const SERVICE_NAME = "tech.berty.bertybridgeexpo.service.BackgroundService";

// Declares the foreground service that keeps Berty running in the background,
// the same way Briar does (foreground service of type connectedDevice).
const withAndroidBackgroundService: ConfigPlugin = (config) => {
	config = AndroidConfig.Permissions.withPermissions(config, [
		"android.permission.FOREGROUND_SERVICE",
		"android.permission.FOREGROUND_SERVICE_CONNECTED_DEVICE", // since Android SDK 34
	]);

	return withAndroidManifest(config, (config) => {
		const application = config.modResults.manifest.application?.[0];
		if (!application) {
			return config;
		}

		if (!application.service) {
			application.service = [];
		}

		const alreadyExists = application.service.some(
			(service: any) => service.$["android:name"] === SERVICE_NAME
		);

		if (!alreadyExists) {
			application.service.push({
				$: {
					"android:name": SERVICE_NAME,
					"android:exported": "false",
					"android:foregroundServiceType": "connectedDevice",
				},
			});
		}

		return config;
	});
};

export default withAndroidBackgroundService;
