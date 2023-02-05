import React, { useMemo } from "react";
import { Clipboard, View, TouchableHighlight, FlatList } from "react-native";
import { ListItem, Spinner, Text, withStyles } from "@ui-kitten/components";
import ArrowDownIcon from "@eliav2/react-native-collapsible-view/ArrowDownIcon";

import equal from "fast-deep-equal";

import { Trace, Step } from "../types/TraceType";
import { Status } from "../types/StatusType";
import { Filters } from "../types/FiltersType";
import { StatusIcon } from "./StatusIcon";
import {
	OnInitTraceList,
	OnAddToTraceList,
	OnUpdateTraceList,
	OnAddToStepList,
} from "../store/Store";
import TraceName from "./TraceName";

interface State {
	traces: Trace[] | null;
	filtered: Trace[] | null;
}

const StepView: React.FC<{ step: Step; style: any }> = ({ step, style }) => (
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
						(step.updateTraceName
							? "\n\nUpdated trace name to: " + step.updateTraceName
							: "") +
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

const TraceView: React.FC<{ trace: Trace; eva?: any }> = ({ trace, eva }) => {
	const [collapsed, setCollapsed] = React.useState(true);
	const toggleCollapsed = React.useCallback(
		() => setCollapsed(!collapsed),
		[collapsed]
	);
	return useMemo(() => {
		const style = eva;
		return (
			<>
				<TouchableHighlight onPress={toggleCollapsed}>
					<View style={style.traceHeader}>
						<View style={style.traceHeaderText}>
							<View style={style.traceTitle}>
								<ArrowDownIcon
									svgProps={{ rotation: collapsed ? -90 : 0 }}
									color={style.traceTitleArrow.backgroundColor}
									thickness={style.traceTitleArrow.thickness}
									size={style.traceTitleArrow.size}
								/>
								<Text
									numberOfLines={1}
									ellipsizeMode="tail"
									style={style.traceTitleText}
								>
									<TraceName eva={eva} traceName={trace.name} />
								</Text>
							</View>
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
									"  |  ID: " +
									trace.id}
							</Text>
						</View>
						<View style={style.traceStatus}>
							<StatusIcon status={trace.status} size={18} />
						</View>
					</View>
				</TouchableHighlight>
				{collapsed || (
					<View style={style.stepList}>
						{trace.initialName !== trace.name &&
							(trace.initialName || "") !== "" && (
								<View style={[style.step, { padding: 10 }]}>
									<Text>Initial trace name: {trace.initialName}</Text>
								</View>
							)}
						{(trace.steps || []).map((step, index) => (
							<StepView key={index} step={step} style={style} />
						))}
					</View>
				)}
			</>
		);
	}, [trace, eva, collapsed, toggleCollapsed]);
};

export class TraceListView extends React.Component<any, State> {
	constructor(props: any) {
		super(props);

		this.state = {
			traces: null,
			filtered: null,
		};
	}

	filterTraces = (traces: Trace[] | null, filters: Filters) => {
		return (traces || []).filter((trace) => {
			if (!filters.displaySucceeded && trace.status === Status.succeeded) {
				return false;
			}
			if (!filters.displayRunning && trace.status === Status.running) {
				return false;
			}
			if (!filters.displayFailed && trace.status === Status.failed) {
				return false;
			}
			if ((filters.regex || "").trim() !== "") {
				try {
					const regex = new RegExp(filters.regex, filters.regexFlags);
					if (filters.searchInTraceTitle) {
						if (regex.test(trace.name)) return true;
						if (regex.test(trace.initialName || "")) return true;
					}
					if (filters.searchInStepTitle || filters.searchInDetail) {
						for (const step of trace.steps) {
							if (filters.searchInStepTitle) {
								if (regex.test(step.name)) return true;
								if (regex.test(step.updateTraceName)) return true;
							}
							if (filters.searchInDetail) {
								for (const detail of step.details) {
									if (regex.test(detail.name)) return true;
									if (regex.test(detail.description)) return true;
								}
							}
						}
					}
				} catch (_) {}
				return false;
			}
			return true;
		});
	};

	onInitTraceList = (traces: Trace[]) => {
		let filtered = this.filterTraces(traces, this.props.filters);
		this.setState({ traces, filtered });
	};

	onAddToTraceList = (trace: Trace) => {
		let traces = (this.state.traces || []).concat(trace);
		let filtered = (this.state.filtered || []).concat(
			this.filterTraces([trace], this.props.filters)
		);
		this.setState({ traces, filtered });
	};

	onUpdateTraceList = (updateTrace: Trace) => {
		let traceExists = false;
		let traces = (this.state.traces || []).map((trace) => {
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
			return;
		}

		let toFilter = false;
		let filtered = (this.state.filtered || []).map((trace) => {
			if (trace.id === updateTrace.id) {
				let traceCopy = { ...trace };
				traceCopy.finished = updateTrace.finished;
				traceCopy.status = updateTrace.status;
				if (updateTrace.name) {
					traceCopy.name = updateTrace.name;
				}

				if (this.filterTraces([traceCopy], this.props.filters).length === 0) {
					toFilter = true;
				}

				return traceCopy;
			}

			return trace;
		});
		if (toFilter) {
			filtered.filter((trace) => trace.id !== updateTrace.id);
		}

		this.setState({ traces, filtered });
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
			return;
		}

		let toFilter = false;
		let filtered = (this.state.filtered || []).map((trace) => {
			if (trace.id === updateTrace.id) {
				let traceCopy = { ...trace };
				traceCopy.steps = traceCopy.steps.concat(updateTrace.steps);
				if (this.filterTraces([traceCopy], this.props.filters).length === 0) {
					toFilter = true;
				}

				return traceCopy;
			}

			return trace;
		});
		if (toFilter) {
			filtered.filter((trace) => trace.id !== updateTrace.id);
		}

		this.setState({ traces, filtered });
	};

	componentDidMount() {
		OnInitTraceList(this.props.sessionID, this.onInitTraceList);
		OnAddToTraceList(this.onAddToTraceList);
		OnUpdateTraceList(this.onUpdateTraceList);
		OnAddToStepList(this.onAddToStepList);
	}

	componentWillUnmount() {
		OnInitTraceList("", () => {});
		OnAddToTraceList(() => {});
		OnUpdateTraceList(() => {});
		OnAddToStepList(() => {});
	}

	componentWillReceiveProps(newProps: any) {
		if (newProps.sessionID !== this.props.sessionID) {
			this.setState({ traces: null, filtered: null });
			OnInitTraceList(newProps.sessionID, this.onInitTraceList);
		} else if (!equal(this.props.filters, newProps.filters)) {
			let filtered = this.filterTraces(this.state.traces, newProps.filters);
			this.setState({ filtered });
		}
	}

	render() {
		const { style } = this.props.eva;

		if (!this.state.traces) {
			return (
				<View style={[style.container, style.containerEmpty]}>
					<Spinner size="giant" status="basic" />
				</View>
			);
		} else if (this.state.traces.length === 0) {
			return (
				<View style={[style.container, style.containerEmpty]}>
					<Text category="h6">No trace available for this session</Text>
				</View>
			);
		} else if (this.state.filtered?.length === 0) {
			return (
				<View style={[style.container, style.containerEmpty]}>
					<Text category="h6">No trace matching this filters found</Text>
				</View>
			);
		} else {
			return (
				<View style={style.container}>
					<FlatList
						data={this.state.filtered}
						renderItem={(info) => (
							<TraceView key={info.item.id} eva={style} trace={info.item} />
						)}
					/>
					<View style={style.counter}>
						<Text>
							{this.state.filtered?.length}/{this.state.traces.length} traces
						</Text>
					</View>
				</View>
			);
		}
	}
}

export const TraceList = withStyles(TraceListView, (theme) => ({
	container: {
		flex: 1,
		backgroundColor: theme["background-basic-color-1"],
	},
	containerEmpty: {
		justifyContent: "center",
		alignItems: "center",
	},
	traceHeader: {
		flex: 1,
		flexDirection: "row",
		justifyContent: "space-between",
		margin: 0,
		paddingVertical: 8,
		paddingLeft: 20,
		paddingRight: 15,
		borderWidth: 0,
		borderBottomWidth: 2,
		borderColor: theme["border-basic-color-3"],
		backgroundColor: theme["background-basic-color-2"],
	},
	traceHeaderText: {
		maxWidth: "90%",
		overflow: "hidden",
	},
	traceTitle: {
		flexDirection: "row",
	},
	traceTitleArrow: {
		backgroundColor: theme["text-basic-color"],
		thickness: 2,
		size: 20,
	},
	traceTitleText: {
		marginLeft: 6,
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
		justifyContent: "center",
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
		cursor: "copy",
	},
	counter: {
		backgroundColor: theme["background-basic-color-1"],
		float: "right",
		position: "absolute",
		paddingVertical: 5,
		paddingHorizontal: 10,
		bottom: 14,
		right: 20,
		borderWidth: 1,
		borderRadius: 6,
		borderColor: theme["border-basic-color-3"],
	},
}));
