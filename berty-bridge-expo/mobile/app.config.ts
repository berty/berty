import { ExpoConfig, ConfigContext } from "expo/config";
import { version } from "./package.json";

// App production config
const APP_NAME = "Berty";
const BUNDLE_IDENTIFIER = "tech.berty.ios";
const PACKAGE_NAME = "tech.berty.android";
const ICON = "./assets/images/berty_adaptative.png";
const EAS_PROJECT_ID = "01cd0667-80ee-4f67-8a43-0d1de5958bce";

export default ({ config }: ConfigContext): ExpoConfig => {
	const { name, bundleIdentifier, packageName, icon, scheme } =
		getDynamicAppConfig(
			config,
			(process.env.APP_ENV as "development" | "preview" | "production") ||
				"development"
		);

	return {
		...config,
		name: name,
		version, // Automatically bump your project version with `npm version patch`, `npm version minor` or `npm version major`.
		slug: "berty",
		platforms: ["ios", "android"],
		orientation: "portrait",
		userInterfaceStyle: "automatic",
		newArchEnabled: true,
		icon: icon,
		scheme: scheme,
		githubUrl: "https://github.com/berty/berty",
		splash: {
			image: "./assets/images/splash.png",
			resizeMode: "contain",
			backgroundColor: "#F8F9FA",
		},
		ios: {
			supportsTablet: true,
			bundleIdentifier: bundleIdentifier,
		},
		android: {
			adaptiveIcon: {
				foregroundImage: icon,
				backgroundColor: "#ffffff",
			},
			package: packageName,
			googleServicesFile: "./google-services.json",
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
			"expo-camera",
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
		],
		experiments: {
			typedRoutes: true,
		},
		owner: "bertytechnologies",
	};
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
			icon: ICON,
			scheme: "release",
		};
	}

	if (environment === "preview") {
		return {
			name: `${APP_NAME} Staff`,
			bundleIdentifier: `${BUNDLE_IDENTIFIER}.staff`,
			packageName: `${PACKAGE_NAME}.staff`,
			icon: "./assets/images/berty_staff_adaptative.png",
			scheme: "staff",
		};
	}

	return {
		name: `${APP_NAME} Debug`,
		bundleIdentifier: `${BUNDLE_IDENTIFIER}.debug`,
		packageName: `${PACKAGE_NAME}.debug`,
		icon: "./assets/images/berty_debug_adaptative.png",
		scheme: "debug",
	};
};
