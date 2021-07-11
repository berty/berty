import React from "react";
import { View, Dimensions } from "react-native";
import { TraceList } from "./TraceList";
import { Session, SessionType } from "../types/NodeType";
import { Divider, Text, withStyles } from "@ui-kitten/components";
import { ArrowLeftOutlined } from "@ant-design/icons";

interface Props {
	selected: Session | null;
}

interface State {
	window: any;
	selected: Session | null;
}

class mainPanel extends React.Component<Props, State> {
	constructor(props: any) {
		super(props);

		this.state = {
			window: Dimensions.get("window"),
			selected: null,
		};
	}

	updateDimension = ({ window }: { window: any }) =>
		this.setState({ window: window });

	componentDidMount() {
		Dimensions.addEventListener("change", this.updateDimension);
	}

	componentWillUnmount() {
		Dimensions.removeEventListener("change", this.updateDimension);
	}

	private getHeaderTitle = () => {
		let session = this.props.selected;

		if (session === null) {
			return "No session selected";
		}

		return (
			"SessionID: " +
			session.id +
			" - " +
			(session.srcType == SessionType.file ? "File" : "Network") +
			": " +
			session.srcName +
			" - Started: " +
			session.started.toLocaleDateString() +
			" " +
			session.started.toLocaleTimeString()
		);
	};

	private renderListOrPlaceholder = (style: any) => {
		if (this.props.selected === null) {
			return (
				<View style={style.placeholder}>
					<ArrowLeftOutlined style={style.placeholderIcon} />
					<Text category="h6">Select a session on the left panel</Text>
				</View>
			);
		}

		return <TraceList sessionID={this.props.selected.id} />;
	};

	render() {
		const { style } = this.props.eva;

		return (
			<View style={[style.mainPanel, { width: this.state.window.width - 256 }]}>
				<View style={style.header}>
					<Text category="s1" style={style.headerTitle}>
						{this.getHeaderTitle()}
					</Text>
				</View>
				<Divider />
				{this.renderListOrPlaceholder(style)}
			</View>
		);
	}
}

export const MainPanel = withStyles(mainPanel, (theme) => ({
	mainPanel: {
		height: "100%",
		overflow: "hidden",
		backgroundColor: theme["background-basic-color-2"],
	},
	placeholder: {
		userSelect: "none",
		flex: 1,
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		right: 20,
		textAlign: "center",
	},
	placeholderIcon: {
		fontSize: 50,
		marginRight: 10,
		color: theme["text-basic-color"],
	},
	header: {
		userSelect: "none",
		borderBottomWidth: 1,
		borderColor: theme["border-basic-color-4"],
		width: "100%",
		height: 60,
		maxHeight: 60,
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: theme["background-basic-color-1"],
	},
	headerTitle: {
		marginLeft: 10,
		textAlign: "center",
	},
}));
