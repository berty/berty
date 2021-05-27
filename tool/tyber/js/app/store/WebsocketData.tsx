import { Node, GoSessionsToNodes, GoSessionToNode } from "../types/NodeType";
import {
    Trace,
    parserCreateTraceEventToTrace,
    parserCreateStepEventToTrace,
    parserUpdateTraceEventToTrace,
} from "../types/TraceType";
import { OpenSession } from "../bridge/JsToGo";
import { ParserCreateTraceEvent, ParserUpdateTraceEvent, ParserCreateStepEvent } from "../types/goTypes"
import { messageHandler } from "../bridge/GoToJs";
import { Platform } from "react-native";

export const WebsocketClient = {
    send: (name: string, data: any) => { }
}

export const shouldUseWebsocket = Platform.OS == "web" && window.location.pathname.endsWith("websocket")

if (shouldUseWebsocket) {
    const preconnectQueue: { name: string, data: any }[] = []
    WebsocketClient.send = (name: string, data: any) => {
        console.warn("FIXME: called send before ready with", name, data);
        preconnectQueue.push({ name, data })
    }

    let address = `ws://localhost:9342/ws`
    const params = new URLSearchParams(document.location.search.substring(1));
    const addressParam = params.get("wsaddr")
    if (addressParam) {
        address = addressParam
    }

    const socket = new WebSocket(address);
    socket.onopen = function () {
        WebsocketClient.send = (name: string, data: any) => {
            socket.send(JSON.stringify({ name, payload: JSON.stringify(data) }))
        }
        for (const elem of preconnectQueue) {
            WebsocketClient.send(elem.name, elem.data)
        }
    }
    socket.onmessage = function (event) {
        const ev = JSON.parse(event.data)
        messageHandler({ name: ev.name, payload: JSON.parse(ev.payload) })
    };
}

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
