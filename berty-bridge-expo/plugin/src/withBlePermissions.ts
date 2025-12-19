import {
	AndroidConfig,
	type ConfigPlugin,
	withAndroidManifest,
	withInfoPlist,
} from "@expo/config-plugins";

type InnerManifest = AndroidConfig.Manifest.AndroidManifest["manifest"];

type ManifestPermission = InnerManifest["permission"];

// TODO: add to `AndroidManifestAttributes` in @expo/config-plugins
type ExtraTools = {
	// https://developer.android.com/studio/write/tool-attributes#toolstargetapi
	"tools:targetApi"?: string;
};

type ManifestUsesPermissionWithExtraTools = {
	$: AndroidConfig.Manifest.ManifestUsesPermission["$"] & ExtraTools;
};

type AndroidManifest = {
	manifest: InnerManifest & {
		permission?: ManifestPermission;
		"uses-permission"?: ManifestUsesPermissionWithExtraTools[];
		"uses-permission-sdk-23"?: ManifestUsesPermissionWithExtraTools[];
		"uses-feature"?: InnerManifest["uses-feature"];
	};
};

const withAndroidPermissions: ConfigPlugin = (config) => {
	config = AndroidConfig.Permissions.withPermissions(config, [
		"android.permission.BLUETOOTH",
		"android.permission.BLUETOOTH_ADMIN",
		"android.permission.BLUETOOTH_CONNECT", // since Android SDK 31
		"android.permission.BLUETOOTH_ADVERTISE", // since Android SDK 31
	]);

	withAndroidManifest(config, (config) => {
		config.modResults = addLocationPermissionToManifest(config.modResults);
		config.modResults = addScanPermissionToManifest(config.modResults);
		return config;
	});

	return config;
};

/**
 * Add location permissions
 *  - 'android.permission.ACCESS_COARSE_LOCATION' for Android SDK 28 (Android 9) and lower
 *  - 'android.permission.ACCESS_FINE_LOCATION' for Android SDK 29 (Android 10) and higher.
 *    From Android SDK 31 (Android 12) it might not be required if BLE is not used for location.
 */
function addLocationPermissionToManifest(androidManifest: AndroidManifest) {
	if (!Array.isArray(androidManifest.manifest["uses-permission-sdk-23"])) {
		androidManifest.manifest["uses-permission-sdk-23"] = [];
	}

	const optMaxSdkVersion = {
		"android:maxSdkVersion": "30",
	};

	if (
		!androidManifest.manifest["uses-permission-sdk-23"].find(
			(item) =>
				item.$["android:name"] === "android.permission.ACCESS_COARSE_LOCATION",
		)
	) {
		androidManifest.manifest["uses-permission-sdk-23"].push({
			$: {
				"android:name": "android.permission.ACCESS_COARSE_LOCATION",
				...optMaxSdkVersion,
			},
		});
	}

	if (
		!androidManifest.manifest["uses-permission-sdk-23"].find(
			(item) =>
				item.$["android:name"] === "android.permission.ACCESS_FINE_LOCATION",
		)
	) {
		androidManifest.manifest["uses-permission-sdk-23"].push({
			$: {
				"android:name": "android.permission.ACCESS_FINE_LOCATION",
				...optMaxSdkVersion,
			},
		});
	}

	return androidManifest;
}

/**
 * Add 'android.permission.BLUETOOTH_SCAN'.
 * Required since Android SDK 31 (Android 12).
 */
function addScanPermissionToManifest(androidManifest: AndroidManifest) {
	if (!Array.isArray(androidManifest.manifest["uses-permission"])) {
		androidManifest.manifest["uses-permission"] = [];
	}

	if (
		!androidManifest.manifest["uses-permission"].find(
			(item) => item.$["android:name"] === "android.permission.BLUETOOTH_SCAN",
		)
	) {
		AndroidConfig.Manifest.ensureToolsAvailable(androidManifest);
		androidManifest.manifest["uses-permission"]?.push({
			$: {
				"android:name": "android.permission.BLUETOOTH_SCAN",
				...{
					"android:usesPermissionFlags": "neverForLocation",
				},
				"tools:targetApi": "31",
			},
		});
	}
	return androidManifest;
}

const withIosPermissions: ConfigPlugin = (config) => {
	const bleDescription =
		"Allow $(PRODUCT_NAME) to connect to bluetooth devices";

	return withInfoPlist(config, (subconfig) => {
		subconfig.modResults.NSBluetoothAlwaysUsageDescription = bleDescription;

		return subconfig;
	});
};

const withBlePermissions: ConfigPlugin = (config) => {
	config = withAndroidPermissions(config);
	config = withIosPermissions(config);

	return config;
};

export default withBlePermissions;
