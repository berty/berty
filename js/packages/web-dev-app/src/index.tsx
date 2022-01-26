import App from './App';

import { AppRegistry } from "react-native";
AppRegistry.registerComponent("App", () => App);

AppRegistry.runApplication("App", {
	rootTag: document.getElementById("root")
});

