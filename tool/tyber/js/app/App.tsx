import React from "react";
import { StyleSheet, Dimensions, Platform } from "react-native";
import { Session } from "./types/NodeType";
import { HandleAstilectronMessages } from "./bridge/GoToJs";
import { InitAstilectronConfig } from "./bridge/JsToGo";
import { Sidebar } from "./components/Sidebar";
import { MainPanel } from "./components/MainPanel";
import { ApplicationProvider, Layout } from "@ui-kitten/components";
import * as eva from "@eva-design/eva";
import { shouldUseWebsocket, WebsocketClient } from "./store/WebsocketData";

interface State {
	theme: any;
	window: any;
	selected: Session | null;
}

export class App extends React.Component<{}, State> {
	themeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

	constructor(props: any) {
		super(props);

		this.state = {
			theme: this.themeMediaQuery.matches ? eva.dark : eva.light,
			window: Dimensions.get("window"),
			selected: null,
		};
	}

	updateTheme = (event: any) =>
		this.setState({ theme: event.matches ? eva.dark : eva.light });

	updateDimension = ({ window }: { window: any }) =>
		this.setState({ window: window });

	updateSelected = (selected: any) => this.setState({ selected: selected });

	componentDidMount() {
		this.themeMediaQuery.addEventListener("change", this.updateTheme);
		Dimensions.addEventListener("change", this.updateDimension);
		if (shouldUseWebsocket) {
			//HandleMessages()
			WebsocketClient.send("init_config", "/tmp/tyber-websocket")
		} else {
			document.addEventListener("astilectron-ready", HandleAstilectronMessages);
			document.addEventListener("astilectron-ready", InitAstilectronConfig);
		}
	}

	componentWillUnmount() {
		this.themeMediaQuery.removeEventListener("change", this.updateTheme);
		Dimensions.removeEventListener("change", this.updateDimension);
		document.removeEventListener("astilectron-ready", HandleAstilectronMessages);
		document.removeEventListener("astilectron-ready", InitAstilectronConfig);
	}

	render() {
		return (
			<>
				<ApplicationProvider {...eva} theme={this.state.theme}>
					<Layout
						style={[styles.container, { maxHeight: this.state.window.height }]}
					>
						<Sidebar updateSelected={this.updateSelected} />
						<MainPanel selected={this.state.selected} />
					</Layout>
				</ApplicationProvider>
			</>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		overflow: "hidden",
		flex: 1,
		flexDirection: "row",
	},
});
