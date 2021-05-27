import { Platform } from "react-native";
import * as Fake from "./FakeData";
import * as Real from "./RealData";
import * as Websocket from "./WebsocketData";

const ns = (() => {
    if (Websocket.shouldUseWebsocket) {
        return Websocket
    }

    // Warning for fakedata
    if (__DEV__) {
        alert("Go backend not bridged: fake data will be displayed");
        return Fake
    }

    return Real;
})()

// Node
export const InitNodeList = ns.InitNodeList;
export const OnInitNodeList = ns.OnInitNodeList;

export const AddToNodeList = ns.AddToNodeList;
export const OnAddToNodeList = ns.OnAddToNodeList;

export const UpdateNodeList = ns.UpdateNodeList;
export const OnUpdateNodeList = ns.OnUpdateNodeList;

// Trace
export const InitTraceList = ns.InitTraceList;
export const OnInitTraceList = ns.OnInitTraceList;

export const AddToTraceList = ns.AddToTraceList;
export const OnAddToTraceList = ns.OnAddToTraceList;

export const UpdateTraceList = ns.UpdateTraceList;
export const OnUpdateTraceList = ns.OnUpdateTraceList;

// Step
export const AddToStepList = ns.AddToStepList;
export const OnAddToStepList = ns.OnAddToStepList;
