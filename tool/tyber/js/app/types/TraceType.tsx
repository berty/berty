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
}

export interface Trace {
	id: string;
	name: string;
	steps: Step[];
	started: Date;
	finished: Date;
	status: Status;
}

export const GoDetailsToDetails = (goDetails: any[]) => {
	let details: Detail[] = [];

	for (let goDetail of goDetails || []) {
		details.push({
			name: goDetail.name,
			description: goDetail.description,
		});
	}

	return details;
};

export const GoStepToStep = (goStep: any) => {
	const step: Step = {
		name: goStep.name,
		details: GoDetailsToDetails(goStep.details),
		started: new Date(goStep.started),
		finished: new Date(goStep.finished),
		status: goStep.status,
	};

	return step;
};

export const GoStepAddToTrace = (goStepAdd: any) => {
	const trace: Trace = {
		id: goStepAdd.id,
		steps: [GoStepToStep(goStepAdd)],
		// All values bellow will be ignored
		name: "",
		started: new Date(),
		finished: new Date(),
		status: Status.running,
	};

	return trace;
};

export const GoTraceToTrace = (goTrace: any) => {
	const trace: Trace = {
		id: goTrace.parentID,
		name: goTrace.name,
		steps: [],
		started: new Date(goTrace.started),
		finished: new Date(goTrace.finished),
		status: goTrace.status,
	};

	for (let goStep of goTrace.steps || []) {
		trace.steps.push(GoStepToStep(goStep));
	}

	return trace;
};

export const GoTracesToTraces = (goTraces: any[]) => {
	let traces: Trace[] = [];

	for (let goTrace of goTraces || []) {
		traces.push(GoTraceToTrace(goTrace));
	}

	return traces;
};
