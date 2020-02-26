export enum AppMessageType {
	UserMessage,
	UserReaction,
	GroupInvitation,
}

export type UserMessage = {
	type: AppMessageType.UserMessage
	body: string
	attachments: Array<{ uri: string }>
}

export type UserReaction = {
	type: AppMessageType.UserReaction
	emoji: string
}

export type GroupInvitation = {
	type: AppMessageType.GroupInvitation
	foo: string
}

export type AppMessage = UserMessage | UserReaction | GroupInvitation
