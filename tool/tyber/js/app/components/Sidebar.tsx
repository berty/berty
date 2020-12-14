import React from "react";
import { View } from "react-native";
import { NodeList } from "./NodeList";
import {
	OpenFiles,
	ClearAllSessions,
	ToggleDevTools,
	OpenPreferences,
} from "../bridge/JsToGo";
import {
	Avatar,
	Button,
	Divider,
	Text,
	withStyles,
} from "@ui-kitten/components";
import {
	FileAddFilled,
	DeleteFilled,
	CodeFilled,
	SettingFilled,
} from "@ant-design/icons";

class sidebar extends React.Component<any> {
	constructor(props: any) {
		super(props);
	}

	render() {
		const { style } = this.props.eva;

		return (
			<View style={style.sidebar}>
				<View style={style.header}>
					<Avatar size="large" source={require("../../assets/icon.png")} />
					<Text category="h4" style={style.headerTitle}>
						Tyber
					</Text>
				</View>
				<Divider />
				<NodeList updateSelected={this.props.updateSelected} />
				<Divider />
				<View style={style.buttonGroup}>
					<Button
						status="basic"
						accessoryLeft={() => <FileAddFilled />}
						style={[style.button, { borderLeftWidth: 0, borderRightWidth: 0 }]}
						onPress={OpenFiles}
					/>
					<Button
						status="basic"
						accessoryLeft={() => <DeleteFilled />}
						style={style.button}
						onPress={ClearAllSessions}
					/>
					<Button
						status="basic"
						accessoryLeft={() => <CodeFilled />}
						style={[style.button, { borderLeftWidth: 0 }]}
						onPress={ToggleDevTools}
					/>
					<Button
						status="basic"
						accessoryLeft={() => <SettingFilled />}
						style={[style.button, { borderLeftWidth: 0, borderRightWidth: 0 }]}
						onPress={OpenPreferences}
					/>
				</View>
			</View>
		);
	}
}

export const Sidebar = withStyles(sidebar, (theme) => ({
	sidebar: {
		borderRightWidth: 2,
		borderColor: theme["border-basic-color-4"],
		width: 256,
		height: "100%",
		overflow: "hidden",
	},
	header: {
		userSelect: "none",
		borderBottomWidth: 1,
		borderColor: theme["border-basic-color-4"],
		width: "100%",
		height: 60,
		maxHeight: 60,
		flex: 1,
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: theme["background-basic-color-1"],
	},
	headerTitle: {
		marginLeft: 10,
		textAlign: "center",
	},
	buttonGroup: {
		flex: 1,
		flexDirection: "row",
		height: 46,
		maxHeight: 46,
		borderColor: theme["border-basic-color-1"],
		borderRightWidth: 1,
	},
	button: {
		flex: 1,
		borderRadius: 0,
		borderColor: theme["border-basic-color-1"],
		borderTopWidth: 0,
		borderBottomWidth: 0,
		fontSize: 20,
		color: theme["color-basic-800"],
	},
}));
