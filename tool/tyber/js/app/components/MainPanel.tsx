import React from "react";
import { Clipboard, View, Dimensions, TouchableOpacity } from "react-native";
import { TraceList } from "./TraceList";
import { Session, SessionType } from "../types/NodeType";
import { Filters } from "../types/FiltersType";
import {
	IndexPath,
	Select,
	SelectItem,
	Input,
	CheckBox,
	Divider,
	Text,
	withStyles,
} from "@ui-kitten/components";
import { ArrowLeftOutlined } from "@ant-design/icons";
import electron from "../bridge/Electron";

interface Props {
	selected: Session | null;
}

interface State {
	window: any;
	selected: Session | null;
	regexFlagsSelected: IndexPath[];
	filters: Filters;
}

const availableRegexFlags = ["i", "m", "s", "u"];

class mainPanel extends React.Component<Props, State> {
	constructor(props: any) {
		super(props);

		this.state = {
			window: Dimensions.get("window"),
			selected: null,
			regexFlagsSelected: [],
			filters: {
				regex: "",
				regexFlags: "",
				searchInTraceTitle: true,
				searchInStepTitle: true,
				searchInDetail: true,
				displaySucceeded: true,
				displayRunning: true,
				displayFailed: true,
			},
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

	filterCheckbox = (filterName: string) => {
		const { style } = this.props.eva;

		return (
			<CheckBox
				checked={this.state.filters[filterName]}
				onChange={(newState) => {
					let filters: Filters = { ...this.state.filters };
					filters[filterName] = newState;
					this.setState({ filters });
				}}
				style={style.headerCheckBox}
			/>
		);
	};

	infoValue = (content: string) => {
		const { style } = this.props.eva;

		return (
			<TouchableOpacity>
				<Text
					numberOfLines={1}
					ellipsizeMode="middle"
					style={[style.headerText, style.headerInfoValuesText]}
					onClick={() => Clipboard.setString(content)}
				>
					{content}
				</Text>
			</TouchableOpacity>
		);
	};

	isRegexValid = () => {
		try {
			new RegExp(this.state.filters.regex);
			return true;
		} catch (_) {
			return false;
		}
	};

	render() {
		const { style } = this.props.eva;
		const session = this.props.selected;

		if (session === null) {
			return (
				<View
					style={[style.mainPanel, { width: this.state.window.width - 256 }]}
				>
					<View style={style.header}>
						<Text category="h6">No session selected</Text>
					</View>

					<Divider />

					<View style={style.listPlaceholder}>
						<ArrowLeftOutlined style={style.listPlaceholderIcon} />
						<Text category="h6">Select a session on the left panel</Text>
					</View>
				</View>
			);
		} else {
			return (
				<View
					style={[style.mainPanel, { width: this.state.window.width - 256 }]}
				>
					<View style={style.header}>
						<View style={style.headerColumn}>
							<View style={style.headerInfoKeys}>
								<Text style={[style.headerText, style.bold]}>SessionID</Text>
								<Text style={[style.headerText, style.bold]}>
									{session.srcType == SessionType.file ? "File" : "Network"}
								</Text>
								<Text style={[style.headerText, style.bold]}>Started</Text>
							</View>
							<View style={[style.valueMargin, style.headerInfoValues]}>
								{this.infoValue(session.id)}
								{this.infoValue(session.srcName)}
								{this.infoValue(
									session.started.toLocaleDateString() +
										" " +
										session.started.toLocaleTimeString()
								)}
							</View>
						</View>

						<View style={[style.headerColumn, style.headerSearch]}>
							<View style={style.headerSearchColumn}>
								<Text style={style.headerRegexLabel}>Regex Search</Text>
								<TouchableOpacity>
									<Text
										style={[style.headerRegexLabel, style.headerRegexHelp]}
										onClick={() => {
											let url = "https://regexr.com/";
											if (__DEV__) {
												window.open(url, "_blank");
											} else {
												electron.shell.openExternal(url);
											}
										}}
									>
										Need Help?
									</Text>
								</TouchableOpacity>
							</View>
							<View style={style.headerSearchColumn}>
								<Input
									autoCorrect={false}
									spellCheck={false}
									placeholder="Enter a regex..."
									onChangeText={(regex) =>
										this.setState({
											filters: {
												...this.state.filters,
												regex: regex,
											},
										})
									}
									size="small"
									status={this.isRegexValid() ? "basic" : "danger"}
									value={this.state.filters.regex}
									style={style.headerRegexInput}
								></Input>
								<Select
									multiSelect={true}
									selectedIndex={this.state.regexFlagsSelected}
									size="small"
									value="⚑"
									onSelect={(regexFlagsSelected) => {
										let filters: Filters = { ...this.state.filters };
										filters.regexFlags = "";
										for (const flag of regexFlagsSelected) {
											if (
												flag.row >= 0 &&
												flag.row < availableRegexFlags.length
											) {
												filters.regexFlags += availableRegexFlags[flag.row];
											}
										}
										this.setState({ regexFlagsSelected, filters });
									}}
									style={style.headerRegexFlags}
								>
									{availableRegexFlags.map((item, index) => {
										return <SelectItem key={index} title={item} />;
									})}
								</Select>
							</View>
						</View>

						<View style={style.headerColumn}>
							<View>
								<Text style={style.headerText}>Search in trace title</Text>
								<Text style={style.headerText}>Search in step title</Text>
								<Text style={style.headerText}>Search in details</Text>
							</View>
							<View style={style.valueMargin}>
								{this.filterCheckbox("searchInTraceTitle")}
								{this.filterCheckbox("searchInStepTitle")}
								{this.filterCheckbox("searchInDetail")}
							</View>
							<View style={style.subColumnMargin}>
								<Text style={style.headerText}>Show succeeded</Text>
								<Text style={style.headerText}>Show running</Text>
								<Text style={style.headerText}>Show failed</Text>
							</View>
							<View style={style.valueMargin}>
								{this.filterCheckbox("displaySucceeded")}
								{this.filterCheckbox("displayRunning")}
								{this.filterCheckbox("displayFailed")}
							</View>
						</View>
					</View>
					<Divider />
					<TraceList sessionID={session.id} filters={this.state.filters} />
				</View>
			);
		}
	}
}

export const MainPanel = withStyles(mainPanel, (theme) => ({
	mainPanel: {
		height: "100%",
		overflow: "hidden",
		backgroundColor: theme["background-basic-color-2"],
	},
	header: {
		userSelect: "none",
		borderBottomWidth: 1,
		borderColor: theme["border-basic-color-4"],
		width: "100%",
		height: 60,
		maxHeight: 60,
		flexDirection: "row",
		justifyContent: "space-evenly",
		alignItems: "center",
		backgroundColor: theme["background-basic-color-1"],
	},
	listPlaceholder: {
		userSelect: "none",
		flex: 1,
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		right: 20,
		textAlign: "center",
	},
	listPlaceholderIcon: {
		fontSize: 50,
		marginRight: 10,
		color: theme["text-basic-color"],
	},
	headerColumn: {
		justifyContent: "center",
		alignItems: "center",
		textAlign: "center",
		width: "30%",
		flexDirection: "row",
	},
	headerText: {
		fontSize: 12,
		textAlign: "left",
	},
	bold: {
		fontWeight: "bold",
	},
	valueMargin: {
		marginLeft: 10,
	},
	subColumnMargin: {
		marginLeft: 20,
	},
	headerInfoKeys: {
		width: 60,
	},
	headerInfoValues: {
		width: "calc(100% - 70px)",
	},
	headerInfoValuesText: {
		cursor: "copy",
	},
	headerSearch: {
		justifyContent: "center",
		alignItems: "center",
		textAlign: "center",
		flexDirection: "column",
		padding: 5,
	},
	headerSearchColumn: {
		flexDirection: "row",
		width: "100%",
	},
	headerRegexLabel: {
		flex: 1,
		marginHorizontal: 4,
		textAlign: "left",
		fontSize: 12,
		fontWeight: "bold",
	},
	headerRegexHelp: {
		textAlign: "right",
		color: theme["text-info-color"],
		cursor: "help",
	},
	headerRegexInput: {
		width: "calc(100% - 94px)",
	},
	headerRegexFlags: {
		width: 84,
		marginLeft: 10,
	},
	headerCheckBox: {
		marginVertical: -2,
		transform: [{ scaleX: 0.6 }, { scaleY: 0.6 }],
	},
}));
