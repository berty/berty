import { ConfigPlugin } from "@expo/config-plugins";
import { withPlugins } from "expo/config-plugins";

import withPush from "./withPush";

const withConfig: ConfigPlugin = (config) => {
	return withPlugins(config, [withPush]);
};

export default withConfig;
// export default withBundleIdentifier;
