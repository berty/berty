import { type ConfigPlugin, withDangerousMod } from "@expo/config-plugins";
import * as fs from "fs";
import * as path from "path";

import icons from "./notificationIconsData";

// Writes the status bar icons used by the native notifications (messages and
// background service) in the generated android/app/src/main/res/drawable-*dpi folders.
const FILES = {
	message: "ic_stat_berty.png",
	service: "ic_stat_berty_service.png",
} as const;

const withAndroidNotificationIcons: ConfigPlugin = (config) =>
	withDangerousMod(config, [
		"android",
		async (config) => {
			const resDir = path.join(
				config.modRequest.platformProjectRoot,
				"app",
				"src",
				"main",
				"res"
			);

			for (const kind of Object.keys(FILES) as (keyof typeof FILES)[]) {
				for (const [density, base64] of Object.entries(icons[kind])) {
					const dir = path.join(resDir, `drawable-${density}`);
					fs.mkdirSync(dir, { recursive: true });
					fs.writeFileSync(
						path.join(dir, FILES[kind]),
						Buffer.from(base64, "base64")
					);
				}
			}

			return config;
		},
	]);

export default withAndroidNotificationIcons;
