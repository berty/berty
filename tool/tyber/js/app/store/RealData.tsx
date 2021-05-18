import { Node, GoSessionsToNodes, GoSessionToNode } from "../types/NodeType";
import {
	Trace,
	parserCreateTraceEventToTrace,
	parserCreateStepEventToTrace,
	parserUpdateTraceEventToTrace,
} from "../types/TraceType";
import { OpenSession } from "../bridge/JsToGo";
import { ParserCreateTraceEvent, ParserUpdateTraceEvent, ParserCreateStepEvent } from "../types/goTypes"

let onInitNodeListCallback: (nodes: Node[]) => void;

export const OnInitNodeList = (updateCallback: (nodes: Node[]) => void) => {
	onInitNodeListCallback = updateCallback;
};

export const InitNodeList = (goSessions: any[]) => {
	onInitNodeListCallback(GoSessionsToNodes(goSessions));
};

let onAddToNodeListCallback: (node: Node) => void;

export const OnAddToNodeList = (updateCallback: (node: Node) => void) => {
	onAddToNodeListCallback = updateCallback;
};

export const AddToNodeList = (goSession: any) => {
	onAddToNodeListCallback(GoSessionToNode(goSession));
};

let onUpdateNodeListCallback: (node: Node) => void;

export const OnUpdateNodeList = (updateCallback: (node: Node) => void) => {
	onUpdateNodeListCallback = updateCallback;
};

export const UpdateNodeList = (goSession: any) => {
	onUpdateNodeListCallback(GoSessionToNode(goSession));
};

let onInitTraceListCallback: (traces: Trace[]) => void;

// TODO: Prevent spam on InitTraceList by keeping track of sessionID after OpenSession
export const OnInitTraceList = (
	sessionID: string,
	updateCallback: (traces: Trace[]) => void
) => {
	if (sessionID.length !== 0) {
		OpenSession(sessionID);
	}
	onInitTraceListCallback = updateCallback;
};

export const InitTraceList = (goPayload: ParserCreateTraceEvent[]) => {
	onInitTraceListCallback((goPayload || []).map(parserCreateTraceEventToTrace));
};

let onAddToTraceListCallback: (trace: Trace) => void;

export const OnAddToTraceList = (updateCallback: (trace: Trace) => void) => {
	onAddToTraceListCallback = updateCallback;
};

export const AddToTraceList = (goPayload: ParserCreateTraceEvent) => {
	onAddToTraceListCallback(parserCreateTraceEventToTrace(goPayload));
};

let onUpdateTraceListCallback: (trace: Trace) => void;

export const OnUpdateTraceList = (updateCallback: (trace: Trace) => void) => {
	onUpdateTraceListCallback = updateCallback;
};

export const UpdateTraceList = (goPayload: ParserUpdateTraceEvent) => {
	onUpdateTraceListCallback(parserUpdateTraceEventToTrace(goPayload));
};

let onAddToStepListCallback: (trace: Trace) => void;

export const OnAddToStepList = (updateCallback: (trace: Trace) => void) => {
	onAddToStepListCallback = updateCallback;
};

export const AddToStepList = (goPayload: ParserCreateStepEvent) => {
	onAddToStepListCallback(parserCreateStepEventToTrace(goPayload));
};
