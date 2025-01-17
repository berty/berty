import {
	ConfigPlugin,
	withXcodeProject,
	withDangerousMod,
} from "@expo/config-plugins";
import * as fs from "fs";
import * as path from "path";

const TARGET_NAME = "NotificationService";
const SOURCE_FILES = [
	"Common.swift",
	"NotificationService.swift",
	"KeystoreDriver.swift",
	"RootDir.swift",
];
const EXT_FILES = ["NotificationService-Info.plist"];
const ENTITLEMENTS_FILE = "ProdNS.entitlements";
const FRAMEWORKS = ["Bertypush.xcframework"];

let iosPath: string;

const withCopyFiles: ConfigPlugin = (config) => {
	// support for monorepos where node_modules can be above the project directory.
	const sourceDir = path.resolve(__dirname, "../src/NotificationService");

	return withDangerousMod(config, [
		"ios",
		async (config) => {
			iosPath = path.join(config.modRequest.projectRoot, "ios");

			/* COPY OVER EXTENSION FILES */
			fs.mkdirSync(`${iosPath}/${TARGET_NAME}`, { recursive: true });

			const allFiles = SOURCE_FILES.concat(EXT_FILES).concat(ENTITLEMENTS_FILE);

			for (let i = 0; i < allFiles.length; i++) {
				const file = allFiles[i];
				const targetFile = `${iosPath}/${TARGET_NAME}/${file}`;
				fs.copyFileSync(`${sourceDir}/${file}`, targetFile);
			}

			for (let i = 0; i < FRAMEWORKS.length; i++) {
				fs.cpSync(
					`${sourceDir}/${FRAMEWORKS[i]}`,
					`${iosPath}/${TARGET_NAME}/${FRAMEWORKS[i]}`,
					{ recursive: true }
				);
			}

			return config;
		},
	]);
};

const withIosPush: ConfigPlugin = (config) => {
	config = withCopyFiles(config);

	return withXcodeProject(config, (newConfig) => {
		const xcodeProject = newConfig.modResults;

		if (xcodeProject.pbxTargetByName(TARGET_NAME)) {
			return newConfig;
		}

		const allFiles = SOURCE_FILES.concat(EXT_FILES);

		// Create new PBXGroup for the extension
		const extGroup = xcodeProject.addPbxGroup(
			allFiles,
			TARGET_NAME,
			TARGET_NAME
		);

		// Add the new PBXGroup to the top level group. This makes the
		// files / folder appear in the file explorer in Xcode.
		const groups = xcodeProject.hash.project.objects["PBXGroup"];
		Object.keys(groups).forEach(function (key) {
			if (
				typeof groups[key] === "object" &&
				groups[key].name === undefined &&
				groups[key].path === undefined
			) {
				xcodeProject.addToPbxGroup(extGroup.uuid, key);
			}
		});

		// WORK AROUND for codeProject.addTarget BUG
		// Xcode projects don't contain these if there is only one target
		// An upstream fix should be made to the code referenced in this link:
		//   - https://github.com/apache/cordova-node-xcode/blob/8b98cabc5978359db88dc9ff2d4c015cba40f150/lib/pbxProject.js#L860
		const projObjects = xcodeProject.hash.project.objects;
		projObjects["PBXTargetDependency"] =
			projObjects["PBXTargetDependency"] || {};
		projObjects["PBXContainerItemProxy"] =
			projObjects["PBXTargetDependency"] || {};

		// Add the target
		// This adds PBXTargetDependency and PBXContainerItemProxy for you
		const nseTarget = xcodeProject.addTarget(
			TARGET_NAME,
			"app_extension",
			TARGET_NAME,
			`${config.ios?.bundleIdentifier}.${TARGET_NAME}`
		);

		// Add build phases to the new target
		xcodeProject.addBuildPhase(
			SOURCE_FILES,
			"PBXSourcesBuildPhase",
			"Sources",
			nseTarget.uuid
		);
		xcodeProject.addBuildPhase(
			[],
			"PBXResourcesBuildPhase",
			"Resources",
			nseTarget.uuid
		);

		const podsRoot = path.join(iosPath, "Pods");
		xcodeProject.addBuildPhase(
			[
				"NotificationService/Bertypush.xcframework",
				`${podsRoot}/OpenSSL-Universal/OpenSSL.xcframework`,
				"libresolv.tbd",
			],
			"PBXFrameworksBuildPhase",
			"Frameworks",
			nseTarget.uuid
		);

		// Set Swift Version, Entitlements and Development Team
		const buildConfs = xcodeProject.hash.project.objects.XCBuildConfiguration;
		Object.keys(buildConfs).forEach(function (key) {
			if (
				typeof buildConfs[key] === "object" &&
				typeof buildConfs[key].buildSettings === "object" &&
				buildConfs[key].buildSettings["PRODUCT_NAME"] === `\"${TARGET_NAME}\"`
			) {
				buildConfs[key].buildSettings["SWIFT_VERSION"] = "5.0";
				buildConfs[key].buildSettings[
					"CODE_SIGN_ENTITLEMENTS"
				] = `${iosPath}/${TARGET_NAME}/${ENTITLEMENTS_FILE}`;
				buildConfs[key].buildSettings["DEVELOPMENT_TEAM"] = "WMBQ84HN4T";
			}
		});

		return newConfig;
	});
};

export default withIosPush;
