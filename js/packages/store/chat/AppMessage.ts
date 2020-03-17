export enum AppMessageType {
	UserMessage,
	UserReaction,
	GroupInvitation,
	SetGroupName,
}

export type UserMessage = {
	type: AppMessageType.UserMessage
	body: string
	isMe?: boolean
	attachments: Array<{ uri: string }>
	sentDate: number
}

export type UserReaction = {
	type: AppMessageType.UserReaction
	emoji: string
}

export type GroupInvitation = {
	type: AppMessageType.GroupInvitation
	groupPk: string
}

export type SetGroupName = {
	type: AppMessageType.SetGroupName
	name: string
}

export type AppMessage = UserMessage | UserReaction | GroupInvitation | SetGroupName
