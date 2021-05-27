import React, { useMemo } from "react";
import { Clipboard, View, TouchableOpacity, ScrollView, FlatList } from "react-native";
import {
	ListItem,
	Spinner,
	Text,
	withStyles,
} from "@ui-kitten/components";

import { Trace, Step } from "../types/TraceType";
import { Status } from "../types/StatusType";
import { StatusIcon } from "./StatusIcon";
import {
	OnInitTraceList,
	OnAddToTraceList,
	OnUpdateTraceList,
	OnAddToStepList,
} from "../store/Store";
import TraceName from "./TraceName"

interface State {
	traces: Trace[] | null;
}

const StepView: React.FC<{ step: Step, style: any }> = ({ step, style }) => (
	<ListItem
		title={step.name}
		description={(props) => {
			let details = "";
			for (let detail of step.details || []) {
				details += "\n" + detail.name + ": " + detail.description;
			}

			return (
				<Text style={[props?.style, { marginTop: 6 }]}>
					{step.started.toLocaleDateString() +
						" " +
						step.started.toLocaleTimeString() +
						(step.updateTraceName ? "\n\nUpdated trace name to: " + step.updateTraceName : "") +
						(details !== "" ? "\n" : "") +
						details}
				</Text>
			);
		}}
		accessoryRight={() => <StatusIcon status={step.status} size={16} />}
		onPress={() => Clipboard.setString(JSON.stringify(step, null, 2))}
		style={style.step}
		activeOpacity={0.7}
	/>
);


const TraceView: React.FC<{ trace: Trace, eva?: any }> = ({ trace, eva }) => {
	const [collapsed, setCollapsed] = React.useState(true)
	const toggleCollapsed = React.useCallback(() => setCollapsed(!collapsed), [collapsed])
	return useMemo(() => {
		const style = eva
		return <>
			<TouchableOpacity onPress={toggleCollapsed}><View style={style.traceHeader}>
				<View style={style.traceHeaderText}>
					<Text
						numberOfLines={1}
						ellipsizeMode="tail"
						style={style.traceTitle}
					>
						{collapsed ? "⇢" : "⇣"} <TraceName eva={eva} traceName={trace.name} />
					</Text>
					<Text
						numberOfLines={1}
						ellipsizeMode="tail"
						style={style.tracePeriod}
					>
						{"Started: " +
							trace.started.toLocaleDateString() +
							" " +
							trace.started.toLocaleTimeString() +
							"  |  Finished: " +
							(trace.status === Status.running
								? "-"
								: trace.finished.toLocaleDateString() +
								" " +
								trace.finished.toLocaleTimeString()) +
							"  |  ID: " + trace.id}
					</Text>
				</View>
				<View style={style.traceStatus}>
					<StatusIcon status={trace.status} size={18} />
				</View>
			</View></TouchableOpacity>
			{collapsed || <View style={style.stepList}>
				{trace.initialName !== trace.name && <View style={[style.step, { padding: 10 }]}><Text>Initial trace name: {trace.initialName || ""}</Text></View>}
				{(trace.steps || []).map((step, index) => <StepView key={index} step={step} style={style} />)}
			</View>}
		</>
	}, [trace, eva, collapsed, toggleCollapsed])
};

export class TraceListView extends React.Component<any, State> {
	constructor(props: any) {
		super(props);

		this.state = {
			traces: null,
		};
	}

	onInitTraceList = (traces: Trace[]) => {
		this.setState({ traces: traces });
	};

	onAddToTraceList = (trace: Trace) => {
		this.setState({
			traces: (this.state.traces || []).concat(trace),
		});
	};

	onUpdateTraceList = (updateTrace: Trace) => {
		let traceExists = false;
		let traces = (this.state.traces || []).map((trace, index) => {
			if (trace.id === updateTrace.id) {
				traceExists = true;
				let traceCopy = { ...trace };
				traceCopy.finished = updateTrace.finished;
				traceCopy.status = updateTrace.status;
				if (updateTrace.name) {
					traceCopy.name = updateTrace.name;
				}

				return traceCopy;
			}

			return trace;
		});

		if (!traceExists) {
			console.error(`can't update trace ${updateTrace.id}: not found`);
		} else {
			this.setState({ traces: traces });
		}
	};

	onAddToStepList = (updateTrace: Trace) => {
		let traceExists = false;
		let traces = (this.state.traces || []).map((trace) => {
			if (trace.id === updateTrace.id) {
				traceExists = true;
				let traceCopy = { ...trace };
				traceCopy.steps = traceCopy.steps.concat(updateTrace.steps);

				return traceCopy;
			}

			return trace;
		});

		if (!traceExists) {
			console.error(`can't add step to trace ${updateTrace.id}: not found`);
		} else {
			this.setState({ traces: traces });
		}
	};

	componentDidMount() {
		OnInitTraceList(this.props.sessionID, this.onInitTraceList);
		OnAddToTraceList(this.onAddToTraceList);
		OnUpdateTraceList(this.onUpdateTraceList);
		OnAddToStepList(this.onAddToStepList);
	}

	componentWillUnmount() {
		OnInitTraceList("", () => { });
		OnAddToTraceList(() => { });
		OnUpdateTraceList(() => { });
		OnAddToStepList(() => { });
	}

	componentWillReceiveProps(newProps: any) {
		if (newProps.sessionID !== this.props.sessionID) {
			this.setState({ traces: null });
			OnInitTraceList(newProps.sessionID, this.onInitTraceList);
		}
	}


	render() {
		const { style } = this.props.eva;

		if (!this.state.traces) {
			return (
				<View style={style.container}>
					<Spinner size="giant" status="basic" />
				</View>
			);
		} else if (this.state.traces.length === 0) {
			return (
				<View style={style.container}>
					<Text category="h6">No trace available for this session</Text>
				</View>
			);
		} else {
			return <FlatList data={this.state.traces} renderItem={(info) =>
				<TraceView key={info.item.id} eva={style} trace={info.item} />
			} />
		}
	}
}

export const TraceList = withStyles(TraceListView, (theme) => ({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	traceList: {
		flex: 1,
	},
	trace: {
		margin: 0,
		borderLeftWidth: 0,
		borderTopWidth: 0,
		borderBottomWidth: 2,
		paddingLeft: 15,
		paddingRight: 0,
		paddingBottom: 0,
		borderColor: theme["border-basic-color-3"],
		backgroundColor: theme["background-basic-color-1"],
		alignItems: "start",
	},
	traceHeader: {
		paddingVertical: 8,
		marginLeft: 15,
		flex: 1,
		flexDirection: "row",
		justifyContent: "space-between",
	},
	traceHeaderText: {
		maxWidth: "90%",
		overflow: "hidden",
	},
	traceTitle: {
		fontFamily: "System",
		fontSize: 15,
		fontWeight: "600",
		color: theme["text-basic-color"],
	},
	tracePeriod: {
		fontFamily: "System",
		fontSize: 12,
		fontWeight: "500",
		color: theme["text-hint-color"],
		marginTop: 4,
	},
	traceStatus: {
		marginRight: 10,
		justifyContent: "center",
	},
	traceCollapsible: {
		left: -15,
		width: "calc(100% + 15px)",
	},
	stepList: {
		paddingVertical: 5,
		backgroundColor: theme["background-basic-color-1"],
		width: "100%",
	},
	step: {
		backgroundColor: theme["background-basic-color-2"],
		borderRadius: 5,
		marginHorizontal: 15,
		marginVertical: 5,
	},
}));

