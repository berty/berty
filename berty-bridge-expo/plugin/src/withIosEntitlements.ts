import { ConfigPlugin, withEntitlementsPlist } from "@expo/config-plugins";

const withIosEntitlements: ConfigPlugin = (config) => {
	return withEntitlementsPlist(config, (config) => {
		config.modResults["aps-environment"] = "production";
		config.modResults["com.apple.developer.associated-domains"] = [
			"applinks:berty.tech",
		];
		config.modResults["com.apple.security.application-groups"] = [
			"group.tech.berty",
		];
		config.modResults["keychain-access-groups"] = [
			"$(AppIdentifierPrefix)tech.berty.ios",
		];
		config.modResults["com.apple.developer.usernotifications.filtering"] = true;
		return config;
	});
};

export default withIosEntitlements;
