export enum Type {
	Basic = 'Basic',
	MessageReceived = 'MessageReceived',
}

export type Basic = {
	type: Type.Basic
	title: string
	message: string
}

export type MessageReceived = {
	type: Type.MessageReceived
	convTitle: string
	convId: string
	body: string
}

export type Notification = Basic | MessageReceived
