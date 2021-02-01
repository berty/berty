import { Status } from "./StatusType";

export enum SessionType {
	file = "file",
	network = "network",
}

export interface Session {
	id: string;
	srcName: string;
	srcType: SessionType;
	header: any;
	started: Date;
	finished: Date;
	status: Status;
}

export interface Node {
	name: string;
	sessions: Session[];
}

export const GoSessionToSession = (goSession: any) => {
	const session: Session = {
		id: goSession.id,
		srcName: goSession.srcName,
		srcType: goSession.srcType,
		header: goSession.header,
		started: new Date(goSession.started),
		finished: new Date(goSession.finished),
		status: goSession.status,
	};
	return session;
};

export const GoSessionToNode = (goSession: any) => {
	const node: Node = {
		name: goSession.displayName,
		sessions: [GoSessionToSession(goSession)] as Session[],
	};
	return node;
};

export const GoSessionsToNodes = (goSessions: any[]) => {
	let nodes: Node[] = [];
	let index: string[] = [];
	let sessions: Map<string, Session[]> = new Map<string, Session[]>();

	for (let goSession of goSessions || []) {
		let session: Session = GoSessionToSession(goSession);
		if (sessions.has(goSession.displayName)) {
			sessions.set(
				goSession.displayName,
				sessions.get(goSession.displayName)!.concat(session)
			);
		} else {
			sessions.set(goSession.displayName, [session] as Session[]);
			index.push(goSession.displayName);
		}
	}

	for (let name of index) {
		nodes.push({
			name: name,
			sessions: sessions.get(name) || [],
		});
	}

	return nodes;
};
