import React from "react";
import { View } from "react-native";
import { StatusIcon } from "./StatusIcon";
import { SessionIcon } from "./SessionIcon";
import { Node, Session } from "../types/NodeType";
import {
	OnInitNodeList,
	OnAddToNodeList,
	OnUpdateNodeList,
} from "../store/Store";
import CollapsibleView from "@eliav2/react-native-collapsible-view";
import { Button, Spinner, Text, withStyles } from "@ui-kitten/components";

interface State {
	selected: {
		nodeIndex: number;
		sessionIndex: number;
	};
	nodes: Node[] | null;
	unread: Map<string, null>;
}

class nodeList extends React.Component<any, State> {
	constructor(props: any) {
		super(props);

		this.state = {
			selected: { nodeIndex: -1, sessionIndex: -1 },
			nodes: null,
			unread: new Map(),
		};
	}

	onInitNodeList = (nodes: Node[]) => {
		this.setState({ nodes: nodes });
		this.props.updateSelected(null);
	};

	onAddToNodeList = (newNode: Node) => {
		let nodeIndex = -1;
		let nodes = (this.state.nodes || []).map((node: Node, index: number) => {
			if (node.name === newNode.name) {
				nodeIndex = index;
				let nodeCopy = { ...node };
				nodeCopy.sessions = nodeCopy.sessions.concat(newNode.sessions);

				return nodeCopy;
			}

			return node;
		});

		if (nodeIndex === -1) {
			nodeIndex = (this.state.nodes || []).length;
			nodes = (this.state.nodes || []).concat(newNode);
		}

		let unreadCopy = new Map(this.state.unread);
		unreadCopy.set(newNode.sessions[0].id, null);

		this.setState({
			nodes: nodes,
			unread: unreadCopy,
		});
	};

	onUpdateNodeList = (updateNode: Node) => {
		let nodeExists = false;
		let sessionExists = false;
		let nodes = (this.state.nodes || []).map((node) => {
			if (node.name === updateNode.name) {
				nodeExists = true;
				node.sessions = (node.sessions || []).map((session) => {
					if (session.id === updateNode.sessions[0].id) {
						sessionExists = true;
						let sessionCopy = { ...session };
						sessionCopy.finished = updateNode.sessions[0].finished;
						sessionCopy.status = updateNode.sessions[0].status;

						return sessionCopy;
					}

					return session;
				});
			}

			return node;
		});

		if (!nodeExists) {
			console.error(`can't update node ${updateNode.name}: not found`);
		} else if (!sessionExists) {
			console.error(
				`can't update session ${updateNode.sessions[0].id}: not found`
			);
		} else {
			this.setState({ nodes: nodes });
		}
	};

	componentDidMount() {
		OnInitNodeList(this.onInitNodeList);
		OnAddToNodeList(this.onAddToNodeList);
		OnUpdateNodeList(this.onUpdateNodeList);
	}

	componentWillUnmount() {
		OnInitNodeList(() => {});
		OnAddToNodeList(() => {});
		OnUpdateNodeList(() => {});
	}

	private renderSessions = (
		nodeIndex: number,
		sessions: Session[],
		style: any
	) => {
		return sessions.map((session: Session, sessionIndex: number) => {
			return (
				<Button
					key={session.id}
					style={[
						style.session,
						sessionIndex === 0 ? { marginTop: 15 } : {},
						this.state.selected.nodeIndex === nodeIndex &&
						this.state.selected.sessionIndex === sessionIndex
							? style.sessionSelected
							: {},
						this.state.unread.has(session.id) ? style.sessionUnread : {},
					]}
					accessoryLeft={() => <SessionIcon type={session.srcType} size={18} />}
					accessoryRight={() => (
						<StatusIcon status={session.status} size={18} />
					)}
					onPress={() => this.onSelect(nodeIndex, sessionIndex)}
				>
					{session.started.toLocaleDateString() +
						" " +
						session.started.toLocaleTimeString()}
				</Button>
			);
		});
	};

	private renderNodes = (style: any) => {
		return (this.state.nodes || []).map((node: Node, nodeIndex: number) => {
			return (
				<CollapsibleView
					key={node.name}
					title={<Text style={style.nodeTitle}>{node.name}</Text>}
					style={style.node}
					initExpanded={nodeIndex == 0 ? true : false}
					arrowStyling={{
						color: this.props.eva.theme["text-basic-color"],
						thickness: 3,
					}}
				>
					{this.renderSessions(nodeIndex, node.sessions || [], style)}
				</CollapsibleView>
			);
		});
	};

	private onSelect = (nodeIndex: number, sessionIndex: number) => {
		let session = this.state.nodes![nodeIndex].sessions[sessionIndex];

		if (this.state.unread.has(session.id)) {
			let unreadCopy = new Map(this.state.unread);
			unreadCopy.delete(session.id);
			this.setState({
				selected: { nodeIndex: nodeIndex, sessionIndex: sessionIndex },
				unread: unreadCopy,
			});
		} else {
			this.setState({
				selected: { nodeIndex: nodeIndex, sessionIndex: sessionIndex },
			});
		}

		this.props.updateSelected(session);
	};

	render() {
		const { style } = this.props.eva;

		if (this.state.nodes === null) {
			return (
				<View style={style.container}>
					<Spinner size="giant" status="basic" />
				</View>
			);
		} else if (this.state.nodes.length === 0) {
			return (
				<View style={style.container}>
					<Text category="h6">Open a file or start a network session</Text>
				</View>
			);
		}

		return <View style={style.nodeList}>{this.renderNodes(style)}</View>;
	}
}

export const NodeList = withStyles(nodeList, (theme) => ({
	container: {
		userSelect: "none",
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: theme["background-basic-color-2"],
		textAlign: "center",
		padding: 30,
	},
	nodeList: {
		flex: 1,
		overflow: "scroll",
		backgroundColor: theme["background-basic-color-2"],
	},
	node: {
		margin: 0,
		borderRightWidth: 0,
		borderTopWidth: 0,
		borderBottomWidth: 2,
		borderColor: theme["border-basic-color-3"],
		backgroundColor: theme["background-basic-color-1"],
		alignItems: "start",
		paddingVertical: 15,
		paddingHorizontal: 10,
	},
	nodeTitle: {
		fontFamily: "System",
		fontSize: 15,
		fontWeight: "600",
		color: theme["text-basic-color"],
		marginHorizontal: 8,
	},
	session: {
		marginTop: 8,
		borderTopWidth: 1,
		borderColor: theme["border-basic-color-2"],
		backgroundColor: theme["background-basic-color-2"],
	},
	sessionSelected: {
		backgroundColor: theme["background-basic-color-4"],
		borderColor: theme["border-alternative-color-4"],
	},
	sessionUnread: {
		backgroundColor: theme["color-info-700"],
	},
}));
