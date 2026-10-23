import { ExpoConfig, ConfigContext } from "expo/config";

// App production config
const APP_NAME = "Berty";
const BUNDLE_IDENTIFIER = "tech.berty.ios";
const PACKAGE_NAME = "tech.berty.android";
const SCHEME = "berty";
const ICON = "./assets/images/icon.png";
const ADAPTIVE_ICON = "./assets/images/berty_adaptive.png";
const EAS_PROJECT_ID = "01cd0667-80ee-4f67-8a43-0d1de5958bce";

export default ({ config }: ConfigContext): ExpoConfig => {
	const { name, bundleIdentifier, packageName, adaptiveIcon } =
		getDynamicAppConfig(
			config,
			(process.env.APP_ENV as "development" | "preview" | "production") ||
				"development"
		);

	return {
		...config,
		name: name,
		slug: "berty",
		platforms: ["ios", "android"],
		orientation: "portrait",
		userInterfaceStyle: "automatic",
		newArchEnabled: true,
		icon: ICON,
		scheme: SCHEME,
		githubUrl: "https://github.com/berty/berty",
		splash: {
			image: "./assets/images/splash.png",
			resizeMode: "contain",
			backgroundColor: "#F8F9FA",
		},
		ios: {
			supportsTablet: true,
			bundleIdentifier: bundleIdentifier,
			buildNumber: config.ios?.buildNumber,
			config: {
				usesNonExemptEncryption: false,
			},
			infoPlist: {
				NSPhotoLibraryUsageDescription:
					"Berty needs access to your photo library to let you share images in conversations.",
			},
		},
		android: {
			adaptiveIcon: {
				foregroundImage: adaptiveIcon,
				backgroundColor: "#ffffff",
			},
			package: packageName,
			versionCode: config.android?.versionCode,
			googleServicesFile: "./google-services.json",
		},
		androidNavigationBar: {
			// White (iOS-like) bar under edge-to-edge: no contrast scrim, dark icons.
			barStyle: "dark-content",
			enforceContrast: false,
		},
		updates: {
			url: `https://u.expo.dev/${EAS_PROJECT_ID}`,
		},
		runtimeVersion: {
			policy: "appVersion",
		},
		extra: {
			eas: {
				projectId: EAS_PROJECT_ID,
				build: {
					experimental: {
						ios: {
							appExtensions: [
								{
									targetName: "NotificationService",
									bundleIdentifier: `${bundleIdentifier}.NotificationService`,
									entitlements: {
										"com.apple.security.application-groups": [
											getAppGroupID(bundleIdentifier),
										],
										"com.apple.developer.associated-domains": [
											"applinks:berty.tech",
										],
										"keychain-access-groups": [
											"$(AppIdentifierPrefix)tech.berty.ios",
										],
										"com.apple.developer.usernotifications.filtering": true,
									},
								},
							],
						},
					},
				},
			},
		},
		web: {
			bundler: "metro",
			output: "static",
			favicon: "./assets/images/favicon.png",
		},
		notification: {
			iosDisplayInForeground: true,
		},
		plugins: [
			"../app.plugin.js",
			"expo-router",
			[
				"expo-font",
				{
					fonts: [
						"./src/assets/font/OpenSans-Bold.ttf",
						"./src/assets/font/OpenSans-Light.ttf",
						"./src/assets/font/OpenSans-LightItalic.ttf",
						"./src/assets/font/OpenSans-Regular.ttf",
						"./src/assets/font/OpenSans-SemiBold.ttf",
						"./src/assets/font/OpenSans-SemiBoldItalic.ttf",
					],
				},
			],
			[
				"expo-camera",
				{
					cameraPermission:
						"Berty uses your camera to scan QR codes, for example to add a contact or join a group.",
				},
			],
			"expo-notifications",
			"expo-web-browser",
			[
				"expo-splash-screen",
				{
					backgroundColor: "#FFFFFF",
					image: "./assets/images/splash.png",
				},
			],
			"expo-audio",
			"@react-native-community/datetimepicker",
			"expo-asset",
		],
		experiments: {
			typedRoutes: true,
		},
		owner: "bertytechnologies",
	};
};

// Derive the iOS App Group container id from the build variant so that
// side-by-side installs don't share storage. Must stay in sync with the
// bridge plugin's getAppGroupID (berty-bridge-expo/plugin/src/appGroup.ts).
const APP_GROUP_PREFIX = "group.tech.berty";
export const getAppGroupID = (id?: string): string => {
	if (!id || id === BUNDLE_IDENTIFIER) {
		return APP_GROUP_PREFIX;
	}
	if (id.startsWith(`${BUNDLE_IDENTIFIER}.`)) {
		return `${APP_GROUP_PREFIX}${id.slice(BUNDLE_IDENTIFIER.length)}`;
	}
	return `${APP_GROUP_PREFIX}.${id}`;
};

// Dynamically configure the app based on the environment.
export const getDynamicAppConfig = (
	config: Partial<ExpoConfig>,
	environment: "development" | "preview" | "production"
) => {
	if (environment === "production") {
		return {
			name: APP_NAME,
			bundleIdentifier: BUNDLE_IDENTIFIER,
			packageName: PACKAGE_NAME,
			adaptiveIcon: ADAPTIVE_ICON,
		};
	}

	if (environment === "preview") {
		return {
			name: `${APP_NAME} Staff`,
			bundleIdentifier: `${BUNDLE_IDENTIFIER}.staff`,
			packageName: `${PACKAGE_NAME}.staff`,
			adaptiveIcon: "./assets/images/berty_staff_adaptive.png",
		};
	}

	return {
		name: `${APP_NAME} Debug`,
		bundleIdentifier: `${BUNDLE_IDENTIFIER}.debug`,
		packageName: `${PACKAGE_NAME}.debug`,
		adaptiveIcon: "./assets/images/berty_debug_adaptive.png",
	};
};
