import { ConfigPlugin, withAndroidManifest } from "@expo/config-plugins";

const SERVICE_NAME =
	"tech.berty.bertybridgeexpo.notification.NotificationService";

const withBertyNotificationService: ConfigPlugin = (config) => {
	return withAndroidManifest(config, (config) => {
		const androidManifest = config.modResults;

		const application = androidManifest.manifest.application?.[0];
		if (!application) {
			return config;
		}

		if (!application.service) {
			application.service = [];
		}

		const services = application.service;

		const alreadyExists = services.some(
			(service: any) => service.$["android:name"] === SERVICE_NAME
		);

		if (!alreadyExists) {
			services.push({
				$: {
					"android:name": SERVICE_NAME,
					"android:exported": "false",
				},
				"intent-filter": [
					{
						action: [
							{
								$: {
									"android:name": "com.google.firebase.MESSAGING_EVENT",
								},
							},
						],
					},
				],
			});
		}

		return config;
	});
};

export default withBertyNotificationService;
