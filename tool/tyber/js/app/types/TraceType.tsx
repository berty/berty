import { ParserAppStep, ParserCreateStepEvent, ParserCreateTraceEvent, ParserUpdateTraceEvent, TyberDetail } from "./goTypes";
import { Status } from "./StatusType";

export interface Detail {
	name: string;
	description: string;
}

export interface Step {
	name: string;
	details: Detail[];
	started: Date;
	finished: Date;
	status: Status;
	updateTraceName: string
}

export interface Trace {
	id: string;
	name: string;
	initialName?: string;
	steps: Step[];
	started: Date;
	finished: Date;
	status: Status;
}

export const tyberDetailToDetail = (goDetail: TyberDetail) => ({
	name: goDetail.name,
	description: goDetail.description,
})

export const parserAppStepToStep = (goStep: ParserAppStep): Step => ({
	name: goStep.name,
	details: (goStep.details || []).map(tyberDetailToDetail),
	started: new Date(goStep.started),
	finished: new Date(goStep.finished),
	status: goStep.status as Status,
	updateTraceName: goStep.updateTraceName,
})

export const parserCreateTraceEventToTrace = (event: ParserCreateTraceEvent): Trace => ({
	id: event.id,
	name: event.name,
	initialName: event.initialName,
	steps: (event.steps || []).map(parserAppStepToStep),
	started: new Date(event.started),
	finished: new Date(event.finished),
	status: event.status as Status,
});

export const parserUpdateTraceEventToTrace = (event: ParserUpdateTraceEvent): Trace => ({
	id: event.id,
	name: event.name,
	steps: [],
	started: new Date(event.started),
	finished: new Date(event.finished),
	status: event.status as Status,
});

export const parserCreateStepEventToTrace = (event: ParserCreateStepEvent): Trace => ({
	id: event.parentID,
	steps: [parserAppStepToStep(event)],
	// All values bellow will be ignored
	name: "",
	started: new Date(),
	finished: new Date(),
	status: Status.running,
});
