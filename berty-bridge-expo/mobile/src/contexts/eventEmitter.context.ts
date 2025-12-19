import mitt from "mitt";
import beapi from "@berty/api";

export type Events = {
	notification: {
		type: beapi.messenger.StreamEvent.Notified.Type | null | undefined;
		name: string;
		payload: any;
	};
};

export const emitter = mitt<Events>();
export type EventName = keyof Events;
