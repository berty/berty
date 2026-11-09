import { ConfigPlugin, withPodfile } from "expo/config-plugins";
import { mergeContents } from "@expo/config-plugins/build/utils/generateCode";

// TEMPORARY: React Native's updateOSDeploymentTarget only raises each pod's
// main target, not its resource bundle targets, which keep the podspec's old
// minimum. Fixed upstream in facebook/react-native#58687 (first shipped in
// RN 0.89). Remove this plugin once the app is on RN >= 0.89
// (https://github.com/berty/berty/issues/5288).
const withIosDeploymentTarget: ConfigPlugin = (config) => {
	return withPodfile(config, (config) => {
		config.modResults.contents = mergeContents({
			tag: "berty-ios-pods-deployment-target",
			src: config.modResults.contents,
			anchor: /^\s*post_install do \|installer\|/m,
			offset: 1,
			comment: "#",
			newSrc: `    # Resource bundles can retain older podspec targets that React Native doesn't update.
    minimum_target = Gem::Version.new(podfile_properties['ios.deploymentTarget'] || min_ios_version_supported)
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |build_config|
        deployment_target = build_config.build_settings['IPHONEOS_DEPLOYMENT_TARGET']
        if deployment_target && Gem::Version.new(deployment_target) < minimum_target
          build_config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = minimum_target.to_s
        end
      end
    end`,
		}).contents;
		return config;
	});
};

export default withIosDeploymentTarget;
