import { Node, Session, SessionType } from "../types/NodeType";
import { Trace, Detail, parserCreateTraceEventToTrace, parserUpdateTraceEventToTrace, parserCreateStepEventToTrace } from "../types/TraceType";
import { Status } from "../types/StatusType";
import { v4 as uuid } from "uuid";
import { loremIpsum } from "lorem-ipsum";
import { ParserCreateTraceEvent, ParserAppStep, ParserUpdateTraceEvent, ParserCreateStepEvent } from "../types/goTypes"

const minSessionsPerNode = 3;
const maxSessionsPerNode = 8;
const minTracesPerSession = 8;
const maxTracesPerSession = 30;
const minStepsPerTrace = 3;
const maxStepsPerTrace = 20;
const minDetailsPerSteps = 0;
const maxDetailsPerSteps = 3;

const minDate = new Date(2020, 0, 1);
const maxDate = new Date();

const minLogSuffix = 100000;
const maxLogSuffix = 999999;

const minPort = 1024;
const maxPort = 49151;

const nodeNames: string[] = [
	"Berty desktop",
	"Jacky's OnePlus 7",
	"Berty daemon (cli)",
	"Berty mini (cli)",
	"Paulette's iPhone",
];

const filePaths: string[] = [
	"~/Desktop/",
	"~/Downloads/",
	"/tmp/logs",
	"/var/logs",
];

const randomIntBetween = (min: number, max: number) => {
	return Math.floor(Math.random() * (max - min + 1) + min);
};

const randomDateBetween = (start: Date, end: Date) => {
	return new Date(
		start.getTime() + Math.random() * (end.getTime() - start.getTime())
	);
};

const randomSessionType = () => {
	const type: SessionType[] = Object.values(SessionType);
	return type[randomIntBetween(0, type.length - 1)];
};

const randomSessionName = (type: SessionType) => {
	if (type === SessionType.file) {
		return (
			filePaths[randomIntBetween(0, filePaths.length - 1)] +
			"log-" +
			randomIntBetween(minLogSuffix, maxLogSuffix)
		);
	}

	return (
		randomIntBetween(9, 254) +
		"." +
		randomIntBetween(0, 254) +
		"." +
		randomIntBetween(0, 254) +
		"." +
		randomIntBetween(0, 254) +
		":" +
		randomIntBetween(minPort, maxPort)
	);
};

const randomStatus = () => {
	const status: Status[] = Object.values(Status);
	return status[randomIntBetween(0, status.length - 1)];
};

const generateFakeNodes = () => {
	let nodes: Node[] = [];

	for (let name of nodeNames) {
		let node: Node = {
			name: name,
			sessions: [],
		};
		let sessionsAmount = randomIntBetween(
			minSessionsPerNode,
			maxSessionsPerNode
		);

		for (let i = 0; i < sessionsAmount; i++) {
			let srcType = randomSessionType();
			let started = randomDateBetween(minDate, maxDate);
			let finished = randomDateBetween(started, maxDate);

			let session: Session = {
				id: uuid(),
				srcName: randomSessionName(srcType),
				srcType: srcType,
				header: {},
				started: started,
				finished: finished,
				status: randomStatus(),
			};

			node.sessions.push(session);
		}

		nodes.push(node);
	}

	return nodes;
};

const actionNames: string[] = [
	"Sending message to",
	"Receiving message from",
	"Sending contact request to",
	"Receiving contact request from",
];

const contactNames: string[] = [
	"Paulette",
	"Francky Vincent",
	"Guilhun",
	"Manfred",
	"Guillaume",
	"Clement",
	"Stephanie de Monaco",
	"James Bond",
	"Alicia",
	"Bob",
];

const randomTraceName = () => {
	return (
		actionNames[randomIntBetween(0, actionNames.length - 1)] +
		" " +
		contactNames[randomIntBetween(0, contactNames.length - 1)]
	);
};

const randomStepName = () => {
	return (
		"Step " +
		loremIpsum({
			count: 1,
			format: "plain",
			sentenceLowerBound: 2,
			sentenceUpperBound: 5,
			units: "sentences",
		})
			.toLowerCase()
			.slice(0, -1)
	);
};

const randomDetail = () => {
	return {
		name: loremIpsum({
			count: 1,
			format: "plain",
			units: "words",
		}),
		description: loremIpsum({
			count: 1,
			format: "plain",
			sentenceLowerBound: 5,
			sentenceUpperBound: 8,
			units: "sentences",
		}).slice(0, -1),
	} as Detail;
};

const randomDetails = () => {
	let details: Detail[] = [];
	let detailsAmount = randomIntBetween(minDetailsPerSteps, maxDetailsPerSteps);

	for (let i = 0; i < detailsAmount; i++) {
		details.push(randomDetail());
	}

	return details;
};

const generateFakeTraces = () => {
	let traces: ParserCreateTraceEvent[] = [];
	let tracesAmount = randomIntBetween(minTracesPerSession, maxTracesPerSession);

	for (let i = 0; i < tracesAmount; i++) {
		let started = randomDateBetween(minDate, maxDate);
		let finished = randomDateBetween(started, maxDate);

		let trace: ParserCreateTraceEvent = {
			id: uuid(),
			name: randomTraceName(),
			steps: [],
			started: started.toString(),
			finished: finished.toString(),
			status: randomStatus(),
			Subs: [],
		};

		let stepsAmount = randomIntBetween(minStepsPerTrace, maxStepsPerTrace);

		for (let i = 0; i < stepsAmount; i++) {
			let started = randomDateBetween(minDate, maxDate);
			let finished = randomDateBetween(started, maxDate);

			let step: ParserAppStep = {
				name: randomStepName(),
				details: randomDetails(),
				started: started.toString(),
				finished: finished.toString(),
				status: randomStatus(),
				forceReopen: false,
				updateTraceName: "",
			};
			trace.steps.push(step);
		}

		traces.push(trace);
	}

	return traces;
};

let fakeNodesData: Node[] = [];

let onInitNodeListCallback: (nodes: Node[]) => void;

export const OnInitNodeList = (updateCallback: (nodes: Node[]) => void) => {
	onInitNodeListCallback = updateCallback;

	// Fake fetching latency
	setTimeout(() => {
		if (fakeNodesData.length === 0) {
			fakeNodesData = generateFakeNodes();
		}
		InitNodeList(fakeNodesData);
	}, 2000);
};

export const InitNodeList = (nodes: Node[]) => {
	onInitNodeListCallback(nodes);
};

let onAddToNodeListCallback: (node: Node) => void;

export const OnAddToNodeList = (updateCallback: (node: Node) => void) => {
	onAddToNodeListCallback = updateCallback;
};

export const AddToNodeList = (node: Node) => {
	onAddToNodeListCallback(node);
};

let onUpdateNodeListCallback: (node: Node) => void;

export const OnUpdateNodeList = (updateCallback: (node: Node) => void) => {
	onUpdateNodeListCallback = updateCallback;
};

export const UpdateNodeList = (node: Node) => {
	onUpdateNodeListCallback(node);
};

let fakeTracesData: Map<string, ParserCreateTraceEvent[]> = new Map<string, ParserCreateTraceEvent[]>();

let onInitTraceListCallback: (traces: Trace[]) => void;
let sessionTraceListRequested: string;

export const OnInitTraceList = (
	sessionID: string,
	updateCallback: (traces: Trace[]) => void
) => {
	onInitTraceListCallback = updateCallback;
	sessionTraceListRequested = sessionID;

	if (sessionID.length === 0) {
		return;
	}

	// Fake fetching latency
	setTimeout(() => {
		if (!fakeTracesData.has(sessionID)) {
			fakeTracesData.set(sessionID, generateFakeTraces());
		}

		if (sessionTraceListRequested === sessionID) {
			InitTraceList(fakeTracesData.get(sessionID) || []);
		}
	}, 3000);
};

export const InitTraceList = (traces: ParserCreateTraceEvent[]) => {
	onInitTraceListCallback(traces.map(parserCreateTraceEventToTrace));
};

let onAddToTraceListCallback: (trace: Trace) => void;

export const OnAddToTraceList = (updateCallback: (trace: Trace) => void) => {
	onAddToTraceListCallback = updateCallback;
};

export const AddToTraceList = (trace: ParserCreateTraceEvent) => {
	onAddToTraceListCallback(parserCreateTraceEventToTrace(trace));
};

let onUpdateTraceListCallback: (trace: Trace) => void;

export const OnUpdateTraceList = (updateCallback: (trace: Trace) => void) => {
	onUpdateTraceListCallback = updateCallback;
};

export const UpdateTraceList = (trace: ParserUpdateTraceEvent) => {
	onUpdateTraceListCallback(parserUpdateTraceEventToTrace(trace));
};

let onAddToStepListCallback: (trace: Trace) => void;

export const OnAddToStepList = (updateCallback: (trace: Trace) => void) => {
	onAddToStepListCallback = updateCallback;
};

export const AddToStepList = (trace: ParserCreateStepEvent) => {
	onAddToStepListCallback(parserCreateStepEventToTrace(trace));
};
