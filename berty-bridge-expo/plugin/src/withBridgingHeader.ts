import { ConfigPlugin, withDangerousMod } from "expo/config-plugins";
import * as fs from "fs";
import * as path from "path";

/**
 * Plugin to copy the bridging header file from the module to the example app
 */
const withBridgingHeader: ConfigPlugin = (config) => {
	return withDangerousMod(config, [
		"ios",
		async (config) => {
			const projectRoot = config.modRequest.projectRoot;

			// Source file path (relative to the module root)
			const sourcePath = path.join(
				projectRoot,
				"..",
				"ios",
				"BertyBridgeExpo-Bridging-Header.h",
			);

			const projectName = config.modRequest.projectName!;

			const destPath = path.join(
				projectRoot,
				"ios",
				projectName,
				`${projectName}-Bridging-Header.h`,
			);

			// Create directories if they don't exist
			const destDir = path.dirname(destPath);
			if (!fs.existsSync(destDir)) {
				fs.mkdirSync(destDir, { recursive: true });
			}

			try {
				// Check if source file exists
				if (fs.existsSync(sourcePath)) {
					// Copy the file
					fs.copyFileSync(sourcePath, destPath);
					console.log(
						`Successfully copied bridging header from ${sourcePath} to ${destPath}`,
					);
				} else {
					console.warn(`Source file not found: ${sourcePath}`);
				}
			} catch (error) {
				console.error(`Failed to copy bridging header: ${error}`);
			}

			return config;
		},
	]);
};

// Export the plugin
export default withBridgingHeader;
